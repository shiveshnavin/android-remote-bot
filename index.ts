import { AndroidBot } from "./bot";
import { XmlUtils } from "./xml";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const bot = new AndroidBot();

async function loginInstagram(): Promise<void> {
  if (!(await bot.isScreenOn())) {
    await bot.turnOnScreen();
  }
  await bot.openActivity(
    "com.instagram.android/com.instagram.android.activity.MainTabActivity"
  );
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
  } else {
    console.log("userNameField not found");
    await bot.pressBackKey();
  }
}

export async function shareFile(filePath: string, activity: string): Promise<void> {
  await bot.scanFile(filePath);
  let mediaId = await bot.getMediaIdFromPath(filePath);
  console.log("Inserted mediaId", mediaId);
  if (mediaId) {
    await bot.shareVideoById(
      mediaId,
      activity
    );
  }
}

export async function igGoNextShare(): Promise<void> {
  let screenJson = await bot.dumpScreenXml();
  await bot.dismissBottomSheetIfPresent(screenJson)
  let nextBtn = await bot.findElementByAttribute("content-desc", "Next", screenJson);
  await bot.clickNode(nextBtn);
}

export async function igEnterCaptionAndPost(caption: string): Promise<void> {
  let screenJson = await bot.dumpScreenXml();
  await bot.dismissBottomSheetIfPresent(screenJson)
  let captionInput = await bot.findElementByAttribute(
    "resource-id",
    "com.instagram.android:id/caption_input_text_view",
    screenJson
  );
  await bot.clickNode(captionInput);
  await bot.clearInputField(10);
  await bot.sleep(1000);
  await bot.typeText(caption);
  await bot.sleep(3000);
  await bot.hideKeyboardIfVisible();
  await bot.sleep(2000);
  screenJson = await bot.dumpScreenXml();


  let shareBtn
  let shared = false;


  if (!shared) {
    shareBtn = await bot.waitFor(() => (bot.findElementByAttribute(
      "resource-id",
      "com.instagram.android:id/share_button"
    )), 5000, 1000, 'share button').catch(e => {
      console.log("Error finding share button:", e.message);
      return null;
    });
    if (shareBtn) {
      await bot.clickNode(shareBtn);
      await bot.sleep(1000);
      await bot.clickNode(shareBtn);
      shared = true;
    }
    let shareBtnByLabel = await bot.waitFor(() => (bot.findElementByLabel("Share")), 5000, 1000, 'share button by label').catch(e => {
      console.log("Error finding share button by label:", e.message);
      return null;
    });
    if (shareBtnByLabel) {
      await bot.clickNode(shareBtnByLabel);
      await bot.sleep(1000);
      await bot.clickNode(shareBtnByLabel);
      shared = true;
    }
  }

  if (!shared) {
    let nextBtn = await bot.waitFor(() => (bot.findElementByLabel("Next")), 5000, 1000, 'next btn button').catch(e => {
      console.log("Error finding next button:", e.message);
      return null;
    });
    if (nextBtn) {
      await bot.clickNode(nextBtn);
      shareBtn = await bot.waitFor(() => (bot.findElementByLabel("Share")), 5000, 1000, 'share button').catch(e => {
        console.log("Error finding share button:", e.message);
        return null;
      });

      if (shareBtn) {
        await bot.clickNode(shareBtn);
        await bot.sleep(1000);
        await bot.clickNode(shareBtn);
        shared = true;
      }
    }
  }

  if (!shared) {
    throw new Error("Unable to find share button, post not shared");
  }
  console.log("Waiting for 5sec for Instagram to finish upload");
  await bot.sleep(5000);
  await bot.pressBackKey(5)
}

async function shareAndPost(): Promise<void> {
  const filePath = "/storage/emulated/0/Download/ttxx.mp4";
  await shareFile(filePath, "com.instagram.android/com.instagram.share.handleractivity.ShareHandlerActivity");
  await igGoNextShare();
  await igEnterCaptionAndPost("test caption");
}


export async function switchProfile(newUserName: string) {
  let screenJson = await bot.dumpScreenXml()
  let profileBtn = await bot.findElementByAttribute("resource-id", "com.instagram.android:id/profile_tab", screenJson)
  await bot.clickAndHoldNode(profileBtn, 2000)
  screenJson = await bot.dumpScreenXml()
  let userBtn = await bot.findElementByAttribute("text", newUserName.trim(), screenJson)
  if (userBtn) {
    await bot.clickNode(userBtn)
  }
  else {
    throw new Error(`Unable to find user ${newUserName} in list of profiles. is the account logged in?`)
  }
}

// shareAndPost();
