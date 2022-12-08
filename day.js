const day = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')

day.extend(utc)
day.extend(timezone)

const today = () => day().tz("utc").add(6, 'hours').format('YYYY-MM-DD')

module.exports = {
    today,
    dayjs: day
}