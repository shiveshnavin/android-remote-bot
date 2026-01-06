"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
let pipe = {
    name: 'test',
    active: true,
    schedule: '*/5 * * * *'
};
let sch = new _1.CronScheduler();
sch.init([pipe], (p) => {
    return p;
});
function assertEquals(lv, rv, msg) {
    if (lv != rv) {
        console.error(`Expected ${lv} to be equal to ${rv}.`, msg);
    }
}
assertEquals(sch.validateCronString('*/5 * * * *'), true, 'check cron validation');
assertEquals(sch.validateCronString('*/5 * **'), false, 'check cron validation');
for (let i = 0; i < 120; i++) {
    let cur = Date.now() + i * 1000 * 60;
    pipe.updatedTimestamp = `${cur}`;
    let run = sch.isPipeRunnable(pipe);
    if (run)
        console.log('Running');
}
