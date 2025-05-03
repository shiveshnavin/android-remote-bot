const { exec } = require("child_process");
const fs = require("fs");
const XmlUtils = require("./xml");
const path = require("path");
console.log("Android BOT");
let wsdir = "./workspace";
if (!fs.existsSync(wsdir)) {
  fs.mkdirSync(wsdir);
}

class AndroidBot {
  async hideKeyboardIfVisible() {
    try {
      // Check if the keyboard is visible
      const keyboardVisible = await this.isKeyboardVisible();

      if (keyboardVisible) {
        console.log("Keyboard is visible, pressing back button...");
        await this.executeCommand("adb shell input keyevent KEYCODE_BACK");
      } else {
        console.log("Keyboard is not visible.");
      }
    } catch (error) {
      console.error("Failed to check or hide keyboard:", error);
    }
  }

  async isKeyboardVisible() {
    try {
      // Run the command to check if the keyboard is visible
      const output = await this.executeCommand(
        "adb shell dumpsys input_method | grep -i 'mInputShown'"
      );

      // If the output contains 'mInputShown=true', the keyboard is visible
      return output.includes("mInputShown=true");
    } catch (error) {
      console.error("Error checking keyboard visibility:", error);
      return false;
    }
  }

  async shareVideoById(mediaId, targetActivity) {
    try {
      // Construct the share intent for the active app (e.g., Instagram)
      const shareCommand = ` adb shell am start -a android.intent.action.SEND   -t video/*   --eu android.intent.extra.STREAM content://media/external/video/media/${mediaId}   -n ${targetActivity}   --grant-read-uri-permission`;
      await this.executeCommand(shareCommand);

      console.log(`Successfully shared media ${mediaId} to ${targetActivity}.`);
    } catch (error) {
      console.error("Failed to share media:", error);
      throw error;
    }
  }

  async scanFile(filePath) {
    try {
      // Execute the scan media command to add the file to the media database
      const command = `adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file://${filePath}`;
      await this.executeCommand(command);
      console.log(
        `File ${filePath} has been scanned and added to media database.`
      );
    } catch (error) {
      console.error("Failed to scan file:", error);
      throw error;
    }
  }

  async getMediaIdFromPath(filePath) {
    try {
      const fileName = path.basename(filePath);
      const queryCommand = `adb shell content query --uri content://media/external/video/media --projection _id:_data | grep '${fileName}'`;
      const result = await this.executeCommand(queryCommand);

      const mediaIdMatch = result.match(/_id=(\d+)/);
      if (mediaIdMatch) {
        const mediaId = mediaIdMatch[1];
        return mediaId;
      } else {
        throw new Error(`No media found for path: ${filePath}`);
      }
    } catch (error) {
      console.error("Failed to get media ID:", error);
      throw error;
    }
  }

  async pressBackKey() {
    const command = `adb shell input keyevent 4`;
    await this.executeCommand(command);
  }
  async pressEnterKey() {
    const command = `adb shell input keyevent 66`;
    await this.executeCommand(command);
  }
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async clearInputField() {
    const command = `adb shell input keyevent 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67`;
    await this.executeCommand(command);
  }

  async typeText(text) {
    try {
      const escapedText = text.replace(/(["\\$`])/g, "\\$1"); // escape special characters
      const command = `adb shell input text "${escapedText}"`;
      const result = await this.executeCommand(command);
      console.log(`Typed text: ${text}`);
      return result;
    } catch (error) {
      console.error(`Failed to type text "${text}":`, error);
      throw error;
    }
  }

  async findElementByAttribute(attr, value, screenJson) {
    const xml = new XmlUtils();
    if (!screenJson) {
      screenJson = await this.dumpScreenXml();
    }
    xml.xmlJson = screenJson;
    const node = await xml.findNodeByAttr(attr, value);
    if (node) {
      console.log("Found node", `${attr}=${value}`);
      return node;
    }
  }
  async findElementByLabel(label, screenJson) {
    const xml = new XmlUtils();
    if (!screenJson) {
      screenJson = await this.dumpScreenXml();
    }
    xml.xmlJson = screenJson;
    const node = await xml.findNodeByLabel(label);
    if (node) {
      console.log("Found node", label);
      return node;
    }
  }
  async clickNode(node) {
    const xml = new XmlUtils();
    let bounts = xml.getBounds(node);
    await this.clickAt(bounts.x, bounts.y);
  }
  async clickAt(x, y) {
    try {
      const command = `adb shell input tap ${x} ${y}`;
      const result = await this.executeCommand(command);
      console.log(`Clicked at coordinates: x=${x}, y=${y}`);
      return result;
    } catch (error) {
      console.error(`Failed to click at coordinates x=${x}, y=${y}:`, error);
      throw error;
    }
  }

  async dumpScreenXml() {
    try {
      let dumpFile = "/sdcard/window_dump.xml";
      await this.executeCommand("adb shell uiautomator dump " + dumpFile);
      const xmlContent = await this.executeCommand("adb shell cat " + dumpFile);
      fs.writeFileSync("dump.xml", xmlContent);
      let xml = new XmlUtils(xmlContent);
      return xml.parseXml(xmlContent);
    } catch (error) {
      console.error("Failed to dump XML layout:", error);
      throw error;
    }
  }

  async openActivity(activityName) {
    try {
      const command = `adb shell am start -n ${activityName}`;
      const result = await this.executeCommand(command);
      console.log(`Activity ${activityName} opened successfully`);
      return result;
    } catch (error) {
      if (
        error.message.includes(
          "intent has been delivered to currently running top-most instance"
        )
      ) {
        return;
      }
      console.error(`Failed to open activity ${activityName}:`, error);
      throw error;
    }
  }

  async turnOnScreen() {
    await this.executeCommand("adb shell input keyevent KEYCODE_WAKEUP");
    await this.executeCommand("adb shell input keyevent KEYCODE_MENU");
  }

  isScreenOn() {
    return new Promise((resolve, reject) => {
      this.executeCommand(
        "su -c dumpsys power | grep mHalInteractiveModeEnabled"
      ).then((stdout) => {
        const screenIsOn = stdout.includes("mHalInteractiveModeEnabled=true");
        resolve(screenIsOn); // return true if screen is OFF
      });
    });
  }

  executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`Command failed: ${error.message}`));
        }
        if (stderr) {
          return reject(new Error(`stderr: ${stderr}`));
        }
        resolve(stdout.trim()); // Resolve with the standard output
      });
    });
  }
}

const bot = new AndroidBot();
// bot.turnOnScreen().then(console.log);

module.exports = AndroidBot;
