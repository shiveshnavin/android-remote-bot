"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostToInstagram = void 0;
const pipelane_1 = require("pipelane");
const fs_1 = require("fs");
const bot_1 = require("../bot");
const post_instagram_1 = require("../post-instagram");
const axios_1 = __importDefault(require("axios"));
class PostToInstagram extends pipelane_1.PipeTask {
    static TASK_VARIANT_NAME = 'instagram-bot';
    static TASK_TYPE_NAME = 'android-bot';
    bot;
    constructor(bot, variantName) {
        super(PostToInstagram.TASK_TYPE_NAME, variantName || PostToInstagram.TASK_VARIANT_NAME);
        this.bot = bot || new bot_1.AndroidBot();
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
    async post(model, targetFile, outpotPostItem) {
        let bot = this.bot;
        if (model.tenant) {
            await bot.openActivity("com.instagram.android/com.instagram.android.activity.MainTabActivity");
            await bot.sleep(5000);
            this.onLog("Switching profile to ", model.tenant);
            await (0, post_instagram_1.switchProfile)(model.tenant);
        }
        await bot.shareVideoByFile(targetFile, "com.instagram.android/com.instagram.share.handleractivity.ShareHandlerActivity");
        await bot.sleep(5000);
        await (0, post_instagram_1.igGoNextShare)();
        await bot.sleep(2000);
        await (0, post_instagram_1.igEnterCaptionAndPost)(outpotPostItem.text);
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
                // await bot.connectToDevice()
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
                let fileName = Date.now() + "_" + getFilenameFromUrl(url);
                let downloadDir = '/sdcard/Download';
                let targetFile = downloadDir + "/" + fileName;
                let localFile = "./workspace/" + fileName;
                let downloadCmd = `wget -q -O ${localFile} ${url} > /dev/null 2>&1`;
                this.onLog(fileName, 'downloading to local:', localFile);
                this.onLog('Posting start: ', caption);
                await (bot.executeCommand(downloadCmd).catch(e => { }));
                if (!(0, fs_1.existsSync)(localFile) || (0, fs_1.statSync)(localFile).size < 100) {
                    throw new Error(`File not downloaded. ${localFile} is empty. Is the file deleted from remote?`);
                }
                this.onLog(localFile, 'pushing to device:', targetFile);
                await bot.executeCommand(`adb push ${localFile} ${targetFile}`);
                await bot.scanFile(targetFile);
                await bot.setVolumeToZero();
                await bot.startCopyClip();
                await bot.pressBackKey(5);
                await bot.disableAnimations();
                await this.post(model, targetFile, outpotPostItem);
                model.status = true;
                model.message = `Posted successfully!`;
                if (input.additionalInputs.cleanup) {
                    if (coverUrl)
                        await axios_1.default.delete(coverUrl).catch(e => {
                            console.log('tolerable error deleting cover for ', fileName, e.message);
                        });
                    await axios_1.default.delete(url).catch(e => {
                        console.log('tolerable error deleting', fileName, e.message);
                    });
                }
            }
            catch (error) {
                await bot.pressBackKey(5);
                console.log("Error processing schedule:", error);
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
