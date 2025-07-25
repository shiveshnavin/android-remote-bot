import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { Node, XmlUtils } from "./xml";

console.log("Android BOT");

let wsdir = "./workspace";
if (!fs.existsSync(wsdir)) {
  fs.mkdirSync(wsdir);
}


export class AndroidBot {


  async connectToDevice(): Promise<void> {
    try {
      const adbd = ` su -c "setprop service.adb.tcp.port 5555; stop adbd;start adbd;`
      await this.executeCommand(adbd);
      const command = `adb connect 127.0.0.1:5555`;
      await this.executeCommand(command);
      console.log("Connected to device at 5555")
    } catch (error) {
      console.error("Failed to connect to device:", error);
      throw error;
    }
  }

  async setVolumeToZero() {
    let cmd = `adb shell input keyevent 25 25 25 25 25 25 25 25 25 25 25 25 25 25 25 25`
    await this.executeCommand(cmd)
  }


  async setVolumeToMax() {
    let cmd = `adb shell input keyevent 24 24 24 24 24 24 24 24 24 24 24 24`
    await this.executeCommand(cmd)
  }
  // Method to kill app by package name
  async killApp(pkg: string): Promise<void> {
    await this.executeCommand(`adb shell am force-stop ${pkg}`);
    console.log("killed app ", pkg);
  }

  // Method to hide keyboard if it's visible
  async hideKeyboardIfVisible(tryHideKeyboardTries = 0): Promise<void> {
    try {
      let keyboardVisible = await this.isKeyboardVisible(); 
      if (!keyboardVisible) {
        console.log("Keyboard is not visible.");
      }
      while (keyboardVisible && tryHideKeyboardTries < 5) {
        console.log("Keyboard is visible, pressing back button...");
        await this.executeCommand("adb shell input keyevent 111");
        if (await this.isKeyboardVisible()) {
          await this.executeCommand("adb shell input keyevent KEYCODE_BACK");
        }
        keyboardVisible = await this.isKeyboardVisible(); 

      }
    } catch (error) {
      console.error("Failed to check or hide keyboard:", error);
    }
  }

  // Method to check if keyboard is visible
  async isKeyboardVisible(): Promise<boolean> {
    try {
      const output = await this.executeCommand(
        'adb shell dumpsys input_method | grep -i "mInputShown"'
      );

      return output.includes("mInputShown=true");
    } catch (error) {
      console.error("Error checking keyboard visibility:", error);
      return false;
    }
  }

  // Method to share video by media ID
  async shareVideoById(mediaId: string, targetActivity: string): Promise<void> {
    try {
      const shareCommand = ` adb shell am start -a android.intent.action.SEND   -t video/*   --eu android.intent.extra.STREAM content://media/external/video/media/${mediaId}   -n ${targetActivity}   --grant-read-uri-permission`;
      await this.executeCommand(shareCommand);

      console.log(`Successfully shared media ${mediaId} to ${targetActivity}.`);
    } catch (error) {
      console.error("Failed to share media:", error);
      throw error;
    }
  }

  // Method to scan a file and add it to the media database
  async scanFile(filePath: string): Promise<void> {
    try {
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

  // Method to get media ID from file path
  async getMediaIdFromPath(filePath: string): Promise<string> {
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

  // Method to simulate back key press
  async pressBackKey(strokes: number = 1): Promise<void> {
    const keyEvents = Array(strokes).fill("4").join(" ");
    const command = "adb shell input keyevent " + keyEvents;
    await this.executeCommand(command);
  }

  // Method to simulate enter key press
  async pressEnterKey(): Promise<void> {
    const command = "adb shell input keyevent 66";
    await this.executeCommand(command);
  }

  // Sleep method
  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async dismissBottomSheetIfPresent(screenJson) {
    try {
      let sheet = await this.findElementByAttribute('resource-id', "com.instagram.android:id/layout_container_bottom_sheet", screenJson)
      if (sheet) {
        console.log('Found bottom sheet, dismissing')
        await this.clickAtTopCenter()
      }
    } catch (e) {
      console.log("Tolerable error dismissing bottomsheet")
    }
  }
  async clickAtTopCenter(): Promise<void> {
    // Get screen size (width x height)
    const sizeOutput = await this.executeCommand(`adb shell wm size`);
    const match = sizeOutput.match(/Physical size:\s*(\d+)x(\d+)/);
    if (!match) throw new Error("Unable to determine screen size");

    // Parse width and height
    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);

    // Calculate the coordinates
    const x = Math.floor(width / 2); // Center of width
    const y = Math.floor(height * 0.1); // 10% of the height

    // Run the ADB tap command
    const command = `adb shell input tap ${x} ${y}`;
    await this.executeCommand(command);
  }


  // Clear input field by simulating backspace key presses
  async clearInputField(strokes: number): Promise<void> {
    const keyEvents = Array(strokes).fill("67").join(" ");
    const command = `adb shell input keyevent ${keyEvents}`;
    await this.executeCommand(command);
  }
  async typeText(text: string): Promise<string> {
    try {
      const parts = text.split(/(\n|\t|\[|\]|\{|\}|\(|\)| |#)/);
      let result = '';

      for (const part of parts) {
        if (part === '') {
          continue;
        } else if (part === '\n') {
          result += await this.executeCommand(`adb shell input keyevent 66`); // KEYCODE_ENTER
        } else if (part === '\t') {
          result += await this.executeCommand(`adb shell input keyevent 61`); // KEYCODE_TAB
        } else if (part === '#') {
          result += await this.executeCommand(`adb shell 'input text "#"'`);
        } else if (part === '[') {
          // Handle left bracket character
          result += await this.executeCommand(`adb shell input keyevent 71`); // KEYCODE_LEFT_BRACKET
        } else if (part === ']') {
          // Handle right bracket character
          result += await this.executeCommand(`adb shell input keyevent 72`); // KEYCODE_RIGHT_BRACKET
        } else if (part === '{') {
          // Handle left brace character
          result += await this.executeCommand(`adb shell input keyevent 73`); // KEYCODE_LEFT_BRACE
        } else if (part === '}') {
          // Handle right brace character
          result += await this.executeCommand(`adb shell input keyevent 74`); // KEYCODE_RIGHT_BRACE
        } else if (part === '(') {
          // Handle left parenthesis character
          result += await this.executeCommand(`adb shell input keyevent 75`); // KEYCODE_LEFT_PARENTHESIS
        } else if (part === ')') {
          // Handle right parenthesis character
          result += await this.executeCommand(`adb shell input keyevent 76`); // KEYCODE_RIGHT_PARENTHESIS
        } else if (part === ' ') {
          // Handle space character using keyevent (replacing the old %s logic)
          result += await this.executeCommand(`adb shell input keyevent 62`); // KEYCODE_SPACE
        }
        else {
          const safeText = part
            .replace(/(["\\$`])/g, "\\$1").replace(/['"`]/g, '');
          if (safeText.length > 0) {
            const command = `adb shell input text "${safeText}"`;
            result += await this.executeCommand(command);
          }
        }
      }

      console.log(`Finished typing text: "${text}"`); // Log the original text
      return result;

    } catch (error) {
      console.error(`Failed to type text "${text}":`, error);
      throw error;
    }
  }

  // Find element by attribute
  async findElementByAttribute(
    attr: string,
    value: string,
    screenJson?: any
  ): Promise<Node> {
    const xml = new XmlUtils();
    if (!screenJson) {
      screenJson = await this.dumpScreenXml();
    }
    xml.xmlJson = screenJson;
    const node = await xml.findNodeByAttr(attr, value);
    if (node) {
      console.log("Found node", `${attr}=${value}`, '@', node.$.bounds);
      return node;
    }
  }

  // Find element by label
  async findElementByLabel(label: string, screenJson?: any): Promise<Node> {
    const xml = new XmlUtils();
    if (!screenJson) {
      screenJson = await this.dumpScreenXml();
    }
    xml.xmlJson = screenJson;
    const node = await xml.findNodeByLabel(label);
    if (node) {
      console.log("Found node", label, '@', node.$.bounds);
      return node;
    }
    else {
      console.error("Node not Found ", label);
    }
  }

  async clickAndHoldNode(node: Node, durationMs: number) {
    const xml = new XmlUtils();
    const bounds = xml.getBounds(node) as any;
    await this.clickAndHold(bounds.x, bounds.y, durationMs);
  }

  async clickNode(node: Node): Promise<void> {
    const xml = new XmlUtils();
    let nodeName = node.$?.text || node.$?.["content-desc"] || node.$?.["resource-id"]
    console.log('clicking node ', nodeName)
    const bounds = xml.getBounds(node) as any;
    try {
      await this.clickAt(bounds.x, bounds.y);
    } catch (e) {
      e.message = 'Error clicking ' + nodeName + ' : ' + e.message
      throw e
    }
  }

  async clickAndHold(x: number, y: number, durationMs: number): Promise<any> {
    try {
      const command = `adb shell input swipe ${x} ${y} ${x} ${y} ${durationMs}`;
      const result = await this.executeCommand(command);
      console.log(`Tap and Hold at coordinates: x=${x}, y=${y}`);
      return result;
    } catch (error) {
      console.error(`Failed to Tap and Hold at coordinates x=${x}, y=${y}:`, error);
      throw error;
    }
  }

  async clickAt(x: number, y: number): Promise<any> {
    try {
      const command = `adb shell input tap ${x} ${y}`;
      const result = await this.executeCommand(command);
      // console.log(`Clicked at coordinates: x=${x}, y=${y}`);
      return result;
    } catch (error) {
      console.error(`Failed to click at coordinates x=${x}, y=${y}:`, error);
      throw error;
    }
  }

  // Dump screen XML layout
  async dumpScreenXml(): Promise<any> {
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

  // Open a specific activity
  async openActivity(activityName: string): Promise<any> {
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

  // Turn on the screen
  async turnOnScreen(): Promise<void> {
    await this.executeCommand("adb shell input keyevent KEYCODE_WAKEUP");
    await this.executeCommand("adb shell input keyevent KEYCODE_MENU");
  }

  async turnOffScreen(): Promise<void> {
    await this.executeCommand("adb shell input keyevent 26");
  }

  // Check if the screen is on
  isScreenOn(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.executeCommand(
        "su -c dumpsys power | grep mHalInteractiveModeEnabled"
      ).then((stdout) => {
        const screenIsOn = stdout.includes("mHalInteractiveModeEnabled=true");
        resolve(screenIsOn);
      }).catch(reject)
    });
  }

  // Execute adb command
  executeCommand(command: string): Promise<string> {
    console.log("exec: " + command)
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`Command failed: ${error.message}`));
        }
        // if (stderr) {
        //   return reject(new Error(`stderr: ${stderr}`));
        // }
        resolve(stdout.trim()); // Resolve with the standard output
      });
    });
  }

}

const bot = new AndroidBot();
// bot.turnOnScreen().then(console.log);
