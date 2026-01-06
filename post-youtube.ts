import { AndroidBot } from "./bot";
import * as dotenv from "dotenv";

dotenv.config();

const bot = new AndroidBot();

export async function ytGoNextShare(): Promise<void> {
  let screenJson = await bot.dumpScreenXml();
  await bot.dismissBottomSheetIfPresent(screenJson)
  let nextBtn = await bot.findElementByAttribute("text", "Next", screenJson);
  await bot.clickNode(nextBtn);
}

export async function ytEnterCaptionAndPost(caption: string): Promise<void> {
  let screenJson = await bot.dumpScreenXml();
  await bot.dismissBottomSheetIfPresent(screenJson)
  let captionInput = await bot.findElementByAttribute(
    "text",
    "Caption",
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
  let shareBtn = await bot.findElementByAttribute("text", "Upload Short")
  if (shareBtn) {
    await bot.clickNode(shareBtn)
  }
  else {
    throw new Error("Unable to find share button");
  }

  console.log("Waiting for 5sec for youtube to finish upload");
  await bot.sleep(5000);
  await bot.pressBackKey(5)
}


export async function switchYtProfile(newUserName: string) {
  let user = newUserName
  let youButton = await bot.findElementByAttribute("resource-id", "com.google.android.youtube:id/pivot_bar_thumbnail")
  await bot.clickNode(youButton)
  let settingsButton = await bot.findElementByAttribute("content-desc", "Settings")
  await bot.clickNode(settingsButton)
  await bot.sleep(2000)
  let switchAccountButton = await bot.findElementByAttribute("text", "Switch account")
  await bot.clickNode(switchAccountButton)
  await bot.sleep(5000)
  let accountToSwitch = await bot.findElementByAttribute("text", `@${user}`)
  if (!accountToSwitch) {
    throw new Error(`Unable to find youtube account with name ${user}`)
  }
  await bot.clickNode(accountToSwitch)
  await bot.sleep(5000)
}

// shareAndPost();
