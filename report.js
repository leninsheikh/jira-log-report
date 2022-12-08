const axios = require('axios').default;
const fs = require('fs')
const day = require('./day')
const notify = require('./notify')
require('dotenv').config()


axios.defaults.headers.common['Accept-Encoding'] = 'application/json';


const basicAuth = process.env.JIRA_BASIC_TOKEN
const bearerAuth = process.env.TEMPO_TOKEN
const domain = process.env.JIRA_DOMAIN

const fetchEnkUsers = async () => {
    const res = (await axios.get(`https://${domain}.atlassian.net/rest/api/2/users?maxResults=500`, {headers: {
        'Authorization': basicAuth
    }})).data

    console.log(res?.length)
    const enkActiveUsers = [];
    const enkActiveAcountsId = [];
    res?.forEach( user => {
        if(user.emailAddress?.includes("enkaizen") && user.active) {
            enkActiveUsers.push(user);
            enkActiveAcountsId.push(user.accountId)
        }
    })

    fs.appendFileSync(`jira_enk_users.json`, JSON.stringify({
        accounts: enkActiveAcountsId,
        accountDetails: enkActiveUsers
    }))
}

const getUserLog = async (accountId, from) => {
    const today = day.today()
    
    const body = {
        "from": from,
        "to": today,
        // "authorIds": accountsId
        "authorIds": [accountId]
    }

    const options = { headers: { 'Authorization': bearerAuth }}
    const logs = (await axios.post('https://api.tempo.io/4/worklogs/search?limit=500', body, options)).data

    let total =  0

    logs.results?.forEach(log => {
        const times = formatSeconds(log.timeSpentSeconds)
        total.hours += times.values.hours
        total.minutes += times.values.minutes
        total.seconds += log.timeSpentSeconds
        total += log.timeSpentSeconds
    })
    const times = formatSeconds(total)
    return {
        hours: times.values.hours,
        minutes: times.values.minutes,
        seconds: total
    }

    return total;
}

const formatSeconds = (seconds) => {
    const totalMinutes = seconds / 60
    const totalHours = totalMinutes / 60
    const hours = Math.floor(totalHours)
    const remindMinutes =   totalMinutes % 60

    return {
        totalHours,
        totalMinutes,
        values: {
            hours,
            minutes: remindMinutes
        }
    }
}


const getTodaysLogs =   async () => {
    const fromDay = day.today()
    const users  = JSON.parse(fs.readFileSync('jira_enk_users.json')).accountDetails;

    const res = await Promise.all(users?.map( async user => {
        const log = await getUserLog(user.accountId, fromDay)

        if(log.seconds <= 0) {
            notify.notifyMissingLog(user.displayName, user.emailAddress)
        }
        return ({
            userName: user.displayName,
            email: user.emailAddress,
            log: log
        })
    }))

    return res
}



module.exports = () => {
    getTodaysLogs().then(logs =>  {
        notify.sendReport(logs)
    })
}
