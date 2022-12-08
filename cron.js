const nodeCron = require('node-cron')
const dayjs = require('./day').dayjs
const report = require('./report')

console.log(dayjs().format('ddd'))
// report()
const job = nodeCron.schedule("0 0 12 * * *", () => {
    const time = dayjs().tz('utc')
    if(['sat', 'sun'].includes(time.format('ddd').toLowerCase())) {
        return;
    }

    report()
});

job.start();