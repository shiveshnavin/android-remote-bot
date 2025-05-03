"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareFile = shareFile;
exports.igGoNextShare = igGoNextShare;
exports.igEnterCaptionAndPost = igEnterCaptionAndPost;
const bot_1 = require("./bot");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const bot = new bot_1.AndroidBot();
async function loginInstagram() {
    if (!(await bot.isScreenOn())) {
        await bot.turnOnScreen();
    }
    await bot.openActivity("com.instagram.android/com.instagram.android.activity.MainTabActivity");
    let screenJson = await bot.dumpScreenXml();
    let userNameField = await bot.findElementByLabel("Username", screenJson);
    console.log("userNameField", userNameField);
    if (userNameField) {
        await bot.clickNode(userNameField);
        await bot.sleep(2000);
        await bot.clearInputField(10); // Assuming 10 is the number of key strokes
        await bot.sleep(1000);
        await bot.typeText(process.env.IG_USER || "");
        let passwordField = await bot.findElementByLabel("Password", screenJson);
        await bot.clickNode(passwordField);
        await bot.clearInputField(10); // Assuming 10 is the number of key strokes
        await bot.typeText("greatking");
        await bot.sleep(1000);
        await bot.pressEnterKey();
        let loginBtn = await bot.findElementByLabel("Log in", screenJson);
        await bot.clickNode(loginBtn);
    }
    else {
        console.log("userNameField not found");
        await bot.pressBackKey();
    }
}
async function shareFile(filePath, activity) {
    await bot.scanFile(filePath);
    let mediaId = await bot.getMediaIdFromPath(filePath);
    console.log("Inserted mediaId", mediaId);
    if (mediaId) {
        await bot.shareVideoById(mediaId, activity);
    }
}
async function igGoNextShare() {
    let screenJson = await bot.dumpScreenXml();
    let nextBtn = await bot.findElementByLabel("Next", screenJson);
    await bot.clickNode(nextBtn);
}
async function igEnterCaptionAndPost(caption) {
    let screenJson = await bot.dumpScreenXml();
    let captionInput = await bot.findElementByAttribute("resource-id", "com.instagram.android:id/caption_input_text_view", screenJson);
    await bot.clickNode(captionInput);
    await bot.clearInputField(10);
    await bot.sleep(1000);
    await bot.typeText(caption);
    await bot.sleep(1000);
    await bot.hideKeyboardIfVisible();
    await bot.sleep(2000);
    screenJson = await bot.dumpScreenXml();
    let shareBtn = await bot.findElementByAttribute("resource-id", "com.instagram.android:id/share_button", screenJson);
    let moreOptions = await bot.findElementByLabel("Share", screenJson);
    // let moreOptions = await bot.findElementByLabel("Save Draft", screenJson);
    if (moreOptions)
        await bot.clickNode(moreOptions);
    if (shareBtn)
        await bot.clickNode(shareBtn);
    console.log("Waiting for 20sec for Instagram to finish upload");
    await bot.sleep(20000);
    // await bot.killApp("com.instagram.android");
}
async function shareAndPost() {
    const filePath = "/storage/emulated/0/Download/ttxx.mp4";
    await shareFile(filePath, "com.instagram.android/com.instagram.share.handleractivity.ShareHandlerActivity");
    await igGoNextShare();
    await igEnterCaptionAndPost("test caption");
}
// shareAndPost();
