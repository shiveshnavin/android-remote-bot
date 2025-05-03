"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchSchedulesTask = void 0;
const pipelane_1 = require("pipelane");
const bot_1 = require("../bot");
class FetchSchedulesTask extends pipelane_1.PipeTask {
    static TASK_VARIANT_NAME = 'instagram-bot';
    static TASK_TYPE_NAME = 'android-bot';
    bot;
    constructor() {
        super(FetchSchedulesTask.TASK_TYPE_NAME, FetchSchedulesTask.TASK_VARIANT_NAME);
        this.bot = new bot_1.AndroidBot();
    }
    kill() {
        return true;
    }
    describe() {
        return {
            summary: 'Fetches scheduled media items based on subType and limit.',
            inputs: {
                last: [],
                additionalInputs: {
                    tenant: 'Username',
                    subType: 'The subType of media to fetch.',
                    limit: 'The maximum number of videos to fetch.',
                },
            },
        };
    }
    async execute(pipeWorksInstance, input) {
        let last = input.last;
        for (let model of last) {
            try {
                let bot = this.bot;
                let isDeviceOn = await bot.isScreenOn();
                this.onLog("Is device on =", isDeviceOn);
                if (!isDeviceOn) {
                    await bot.turnOnScreen();
                    this.onLog("Woke up device");
                }
            }
            catch (error) {
                this.onLog(`Error processing schedule: ${error.message}`);
                model.status = false;
                model.message = `Error processing schedule: ${error.message}`;
            }
        }
        return last;
    }
    async wakeDevice() {
    }
}
exports.FetchSchedulesTask = FetchSchedulesTask;
