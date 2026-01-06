"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostToYoutube = void 0;
const bot_1 = require("../bot");
const PostToInstagram_1 = require("./PostToInstagram");
const post_youtube_1 = require("../post-youtube");
class PostToYoutube extends PostToInstagram_1.PostToInstagram {
    static TASK_VARIANT_NAME = 'youtube-bot';
    constructor(bot) {
        super(bot, PostToYoutube.TASK_VARIANT_NAME);
        this.bot = bot || new bot_1.AndroidBot();
    }
    kill() {
        return true;
    }
    describe() {
        let desc = super.describe();
        desc.summary = 'Automatically posts to youtube.';
        return desc;
    }
    async post(model, targetFile, outputPostItem) {
        let bot = this.bot;
        if (model.tenant) {
            await bot.startApp("com.google.android.youtube");
            await bot.sleep(5000);
            this.onLog("Switching profile to ", model.tenant);
            await (0, post_youtube_1.switchYtProfile)(model.tenant);
        }
        await bot.shareVideoByFile(targetFile, undefined, "com.google.android.youtube");
        await bot.sleep(2000);
        // we click on center of vide tp pause it as animating fails the xml dump based element finding
        await bot.clickAtCenter();
        await bot.sleep(1000);
        await (0, post_youtube_1.ytGoNextShare)(); // next 1
        await bot.sleep(1000);
        await (0, post_youtube_1.ytGoNextShare)(); // next 2
        await bot.sleep(2000);
        await (0, post_youtube_1.ytEnterCaptionAndPost)(outputPostItem.text_small || 'Check this out !');
    }
}
exports.PostToYoutube = PostToYoutube;
