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
exports.ytGoNextShare = ytGoNextShare;
exports.ytEnterCaptionAndPost = ytEnterCaptionAndPost;
exports.switchYtProfile = switchYtProfile;
const bot_1 = require("./bot");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const bot = new bot_1.AndroidBot();
async function ytGoNextShare() {
    let screenJson = await bot.dumpScreenXml();
    await bot.dismissBottomSheetIfPresent(screenJson);
    let nextBtn = await bot.findElementByAttribute("text", "Next", screenJson);
    await bot.clickNode(nextBtn);
}
async function ytEnterCaptionAndPost(caption) {
    let screenJson = await bot.dumpScreenXml();
    await bot.dismissBottomSheetIfPresent(screenJson);
    let captionInput = await bot.findElementByAttribute("text", "Caption", screenJson);
    await bot.clickNode(captionInput);
    await bot.clearInputField(10);
    await bot.sleep(1000);
    await bot.typeText(caption);
    await bot.sleep(3000);
    await bot.hideKeyboardIfVisible();
    await bot.sleep(2000);
    screenJson = await bot.dumpScreenXml();
    let shareBtn = await bot.findElementByAttribute("text", "Upload Short");
    if (shareBtn) {
        await bot.clickNode(shareBtn);
    }
    else {
        throw new Error("Unable to find share button");
    }
    console.log("Waiting for 5sec for youtube to finish upload");
    await bot.sleep(5000);
    await bot.pressBackKey(5);
}
async function switchYtProfile(newUserName) {
    let user = newUserName;
    let youButton = await bot.findElementByAttribute("resource-id", "com.google.android.youtube:id/pivot_bar_thumbnail");
    await bot.clickNode(youButton);
    let settingsButton = await bot.findElementByAttribute("content-desc", "Settings");
    await bot.clickNode(settingsButton);
    await bot.sleep(2000);
    let switchAccountButton = await bot.findElementByAttribute("text", "Switch account");
    await bot.clickNode(switchAccountButton);
    await bot.sleep(5000);
    let accountToSwitch = await bot.findElementByAttribute("text", `@${user}`);
    if (!accountToSwitch) {
        throw new Error(`Unable to find youtube account with name ${user}`);
    }
    await bot.clickNode(accountToSwitch);
    await bot.sleep(5000);
}
// shareAndPost();
