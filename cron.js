const nodeCron = require('node-cron')
const dayjs = require('./day').dayjs
const report = require('./report')

console.log(dayjs().format('ddd'))
const start = () => {
    const time = dayjs().tz('utc')
    if(['sat', 'sun'].includes(time.format('ddd').toLowerCase())) {
        return;
    }

    report()
}
start()
const job = nodeCron.schedule("0 0 9 * * *", () => {
    start()
});

const job2 = nodeCron.schedule("0 0 10 * * *", () => {
    start()

});

const job3 = nodeCron.schedule("0 0 11 * * *", () => {
    start()

});


const job4 = nodeCron.schedule("0 0 12 * * *", () => {
    start()

});

job.start();
job2.start();
job3.start();
job4.start();