"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostToInstagram = void 0;
const pipelane_1 = require("pipelane");
const bot_1 = require("../bot");
class PostToInstagram extends pipelane_1.PipeTask {
    static TASK_VARIANT_NAME = 'instagram-bot';
    static TASK_TYPE_NAME = 'android-bot';
    bot;
    constructor() {
        super(PostToInstagram.TASK_TYPE_NAME, PostToInstagram.TASK_VARIANT_NAME);
        this.bot = new bot_1.AndroidBot();
    }
    kill() {
        return true;
    }
    describe() {
        return {
            summary: 'Automatically posts to instagram.',
            inputs: {
                last: [{
                        id: 'string',
                        nextTimeStamp: 'number',
                        extra: 'string',
                        status: 'boolean',
                        subType: 'string',
                        tenant: 'string',
                        type: 'string',
                        payload: {
                            generated_cover_file_url: 'string',
                            generated_file_url: 'string',
                            outpotPostItem: 'string',
                        }
                    }],
                additionalInputs: {},
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
exports.PostToInstagram = PostToInstagram;
