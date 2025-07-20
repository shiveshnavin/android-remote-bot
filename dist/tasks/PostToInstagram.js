"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostToInstagram = void 0;
const pipelane_1 = require("pipelane");
const bot_1 = require("../bot");
const __1 = require("..");
const axios_1 = __importDefault(require("axios"));
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
                            generated_cover_file_url: 'string, url of the file',
                            generated_file_url: 'string, optional, url of the cover file',
                            outpotPostItem: {
                                text: 'string, caption text for the post'
                            },
                        }
                    }],
                additionalInputs: {
                    generated_cover_file_url: 'string, url of the file',
                    generated_file_url: 'string, optional, url of the cover file',
                    outpotPostItem: {
                        text: 'string, caption text for the post'
                    },
                },
            },
        };
    }
    posted = [];
    async execute(pipeWorksInstance, input) {
        let bot = this.bot;
        let last = input.last;
        if (!last || last.length == 0) {
            last = [{
                    payload: input.additionalInputs
                }];
        }
        for (let model of last) {
            try {
                let isDeviceOn = await bot.isScreenOn();
                this.onLog("Is device on =", isDeviceOn);
                if (!isDeviceOn) {
                    await bot.turnOnScreen();
                    this.onLog("Woke up device");
                }
                let payload = model.payload;
                if (typeof payload == 'string') {
                    payload = JSON.parse(payload);
                }
                let outpotPostItem = payload.outpotPostItem;
                if (typeof outpotPostItem == 'string') {
                    outpotPostItem = JSON.parse(outpotPostItem);
                }
                let caption = outpotPostItem.text;
                let url = payload.generated_file_url;
                let coverUrl = payload.generated_cover_file_url;
                if (this.posted.includes(url)) {
                    model.status = true;
                    model.message = `Posted successfully!`;
                    continue;
                }
                this.posted.push(url);
                let fileName = getFilenameFromUrl(url);
                let downloadDir = '/sdcard/Download';
                let targetFile = downloadDir + "/" + fileName;
                let downloadCmd = `wget -q -O ${targetFile} ${url}  > /dev/null 2>&1`;
                this.onLog(fileName, 'downloading to', targetFile);
                this.onLog('Posting start: ', caption);
                await (bot.executeCommand(downloadCmd).catch(e => { }));
                await bot.setVolumeToZero();
                await bot.pressBackKey(5);
                if (model.tenant) {
                    await bot.openActivity("com.instagram.android/com.instagram.android.activity.MainTabActivity");
                    await bot.sleep(5000);
                    await (0, __1.switchProfile)(model.tenant);
                }
                await (0, __1.shareFile)(targetFile, "com.instagram.android/com.instagram.share.handleractivity.ShareHandlerActivity");
                await bot.sleep(15000);
                await (0, __1.igGoNextShare)();
                await bot.sleep(2000);
                await (0, __1.igEnterCaptionAndPost)(caption);
                model.status = true;
                model.message = `Posted successfully!`;
                if (coverUrl)
                    await axios_1.default.delete(coverUrl).catch(e => {
                        console.log('tolerable error deleting cover for ', fileName, e.message);
                    });
                await axios_1.default.delete(url).catch(e => {
                    console.log('tolerable error deleting', fileName, e.message);
                });
            }
            catch (error) {
                await bot.pressBackKey(5);
                this.onLog(`Error processing schedule: ${error.message}`);
                model.status = false;
                model.message = `Error processing schedule: ${error.message}`;
            }
        }
        // await bot.turnOffScreen()
        return last;
    }
    async wakeDevice() {
    }
}
exports.PostToInstagram = PostToInstagram;
const getFilenameFromUrl = (urlString) => {
    try {
        const url = new URL(urlString);
        // Get the pathname (e.g., '/path/to/file.txt')
        const pathname = url.pathname;
        // Find the last slash and take the substring after it
        const lastSlashIndex = pathname.lastIndexOf('/');
        const filename = pathname.substring(lastSlashIndex + 1);
        return filename;
    }
    catch (error) {
        // Handle invalid URLs
        console.error("Invalid URL:", urlString, error);
        return ""; // Return empty string for invalid URLs
    }
};
