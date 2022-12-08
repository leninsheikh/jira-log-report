const nodemailer = require('nodemailer')
const day = require('./day')



const getTemplate = logs => {
    const today = day.today();
    let html = `<h2>Date: ${today}</h2>`;
    logs.forEach(log => {
        let time = log.log.seconds > 0
            ? `${log.log.hours} hours, ${log.log.minutes} minutes`
            : `<span style="color:red">${log.log.hours} hours, ${log.log.minutes} minutes</span>`

        html += `<p><b>${log.userName}</b> - ${time}</p>`
    })
    console.log(html)
    return html;
}

const notifyMissingLog = (name, email) => {
    const today = day.today();

    const html = `<h2>Date: ${today}</h2><p>Hey ${name}, you are forget to add Jira Time-Entry today! Please add it as soon as possible.</p>`

    send(email, html)
}

const sendReport = logs => {
    const html = getTemplate(logs)
    send('lenin@enkaizen.com', html)
}

const send = (email, body) => {
    if (email !== 'lenin@enkaizen.com') return;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NODEMAILER_GMAIL,
            pass: process.env.NODEMAILER_PASS
        }
    });
    //   return getTemplate(logs);
    const mailOptions = {
        from: process.env.NODEMAILER_SENDER,
        to: email,
        subject: 'Jira Time Log Report',
        html: body
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            // do something useful
        }
    });
}

module.exports = {
    sendReport,
    notifyMissingLog
}