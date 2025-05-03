const AndroidBot = require("./bot");
const XmlUtils = require("./xml");
const fs = require("fs");
require("dotenv").config();

const bot = new AndroidBot();

async function loginInstagram() {
  if (!(await bot.isScreenOn())) {
    await bot.turnOnScreen();
  }
  bot.openActivity(
    "com.instagram.android/com.instagram.android.activity.MainTabActivity"
  );
  let screenJson = await bot.dumpScreenXml();

  let userNameField = await bot.findElementByLabel("Username", screenJson);
  console.log("userNameField", userNameField);

  if (userNameField) {
    await bot.clickNode(userNameField);
    await bot.sleep(2000);
    await bot.clearInputField();
    await bot.sleep(1000);
    await bot.typeText(process.env.IG_USER);

    let passwordField = await bot.findElementByLabel("Password", screenJson);
    await bot.clickNode(passwordField);
    await bot.clearInputField();
    await bot.typeText("greatking");
    await bot.sleep(1000);
    await bot.pressEnterKey();

    let loginBtn = await bot.findElementByLabel("Log in", screenJson);
    await bot.clickNode(loginBtn);
  } else {
    console.log("userNameField not found");
    await bot.pressBackKey();
  }
}

async function shareFile() {
  const filePath = "/storage/emulated/0/Download/ttxx.mp4";
  await bot.scanFile(filePath);
  let mediaId = await bot.getMediaIdFromPath(filePath);
  console.log("Inserted mediaId", mediaId);
  if (mediaId) {
    await bot.shareVideoById(
      mediaId,
      "com.instagram.android/com.instagram.share.handleractivity.ShareHandlerActivity"
    );
  }
}

async function postReel() {
  let screenJson = await bot.dumpScreenXml();
  let nextBtn = await bot.findElementByLabel("Next", screenJson);
  await bot.clickNode(nextBtn);
}

async function enterCaptionAndpost() {
  let screenJson = await bot.dumpScreenXml();
  let captionInput = await bot.findElementByAttribute(
    "resource-id",
    "com.instagram.android:id/caption_input_text_view",
    screenJson
  );
  await bot.clickNode(captionInput);
  await bot.clearInputField();
  await bot.sleep(1000);
  await bot.typeText("Checkout");
  await bot.sleep(1000);
  await bot.hideKeyboardIfVisible();
  await bot.sleep(2000);
  screenJson = await bot.dumpScreenXml();
  let shareBtn = await bot.findElementByAttribute(
    "resource-id",
    "com.instagram.android:id/share_button",
    screenJson
  );
  let moreOptions = await bot.findElementByLabel("Share", screenJson);
  if (moreOptions) await bot.clickNode(moreOptions);
  if (shareBtn) await bot.clickNode(shareBtn);
  console.log("Waiting for 20sec for instagram to finish upload");
  await bot.sleep(20000);
  await bot.killApp("com.instagram.android");
}
async function shareAndPost() {
  await shareFile();
  await postReel();
  await enterCaptionAndpost();
}

shareAndPost();
