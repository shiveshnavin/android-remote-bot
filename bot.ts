import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { Node, XmlUtils } from "./xml";
import { detectBounds } from "./detect-bounds";

console.log("Android BOT");
let copyClipPath = path.join(__dirname, '../copyclip');
let termuxClipPath = "/data/data/com.termux/files/usr/bin/termux-clipboard-set";
let wsdir = "./workspace";
if (!fs.existsSync(wsdir)) {
  fs.mkdirSync(wsdir);
}


export class AndroidBot {


  async startCopyClip() {
    try {
      // Start the Clipper app to handle clipboard operations
      await this.executeCommand("adb shell am startservice ca.zgrs.clipper/.ClipboardService");
      console.log('Folder', await this.executeCommand("adb shell \"pwd\""));
      await this.executeCommand(`adb shell su -c \"chmod +x ${copyClipPath}\"`);
      console.log("Started Clipper app for clipboard operations.");
    } catch (error) {
      console.error("W: Failed to start Clipper app:", error.message);
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      const output = await this.executeCommand("adb devices");
      return output.includes("device") || output.includes("emulator");
    } catch (error) {
      console.error("Failed to check device connection:", error);
      return false;
    }
  }


  async connectToDevice(): Promise<void> {
    try {
      const adbd = `adb shell su -c "setprop service.adb.tcp.port 5555; stop adbd;start adbd;"`
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
        await this.executeCommand("adb shell input keyevent KEYCODE_ESCAPE");
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


  //swipe from x1,y1 to x2,y2
  async swipe(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    duration: number = 200
  ): Promise<void> {
    try {
      const command = `adb shell input swipe ${x1} ${y1} ${x2} ${y2} ${duration}`;
      const result = await this.executeCommand(command);
      console.log(`Swiped from (${x1}, ${y1}) to (${x2}, ${y2}) over ${duration}ms.`);
    } catch (error) {
      console.error(`Failed to swipe:`, error);
      throw error;
    }
  }



  async getScreenResolution(): Promise<{ width: number, height: number }> {
    try {
      const sizeOutput = await this.executeCommand(`adb shell wm size`);
      const match = sizeOutput.match(/Physical size:\s*(\d+)x(\d+)/);
      if (!match) throw new Error("Unable to determine screen size");

      const width = parseInt(match[1], 10);
      const height = parseInt(match[2], 10);
      return { width, height };
    } catch (error) {
      console.error(`Failed to get screen resolution:`, error);
      throw error;
    }
  }


  async swipeRightFromCenter(): Promise<void> {
    try {

      // Get screen size (width x height)
      const match = await this.getScreenResolution();
      const width = match.width
      const height = match.height

      const x1 = Math.floor(width * 0.2); // Starting x (20% from left)
      const y1 = Math.floor(height / 2); // Starting y (center)
      const x2 = Math.floor(width * 0.8); // Ending x (80% from left)
      const y2 = Math.floor(height / 2); // Ending y (center)

      // Perform the swipe
      await this.swipe(x1, y1, x2, y2);
      console.log(`Swiped right from center.`);
    } catch (error) {
      console.error(`Failed to swipe right from center:`, error);
      throw error;
    }
  }

  async swipeLeftFromCenter(): Promise<void> {
    try {

      // Get screen size (width x height)
      const match = await this.getScreenResolution();
      const width = match.width
      const height = match.height

      const x1 = Math.floor(width * 0.8); // Starting x (80% from left)
      const y1 = Math.floor(height / 2); // Starting y (center)
      const x2 = Math.floor(width * 0.2); // Ending x (20% from left)
      const y2 = Math.floor(height / 2); // Ending y (center)

      // Perform the swipe
      await this.swipe(x1, y1, x2, y2);
      console.log(`Swiped left from center.`);
    } catch (error) {
      console.error(`Failed to swipe left from center:`, error);
      throw error;
    }
  }



  async swipeUpFromCenter(): Promise<void> {
    try {
      const match = await this.getScreenResolution();
      const width = match.width
      const height = match.height

      const x1 = Math.floor(width / 2); // Starting x (center)
      const y1 = Math.floor(height * 0.8); // Starting y (80% from top)
      const x2 = Math.floor(width / 2); // Ending x (center)
      const y2 = Math.floor(height * 0.2); // Ending y (20% from top)
      // Perform the swipe
      await this.swipe(x1, y1, x2, y2);
      console.log(`Swiped up from center.`);
    } catch (error) {
      console.error(`Failed to swipe up from center:`, error);
      throw error;
    }
  }

  async swipeDownFromCenter(): Promise<void> {
    try {
      // Get screen size (width x height)
      const match = await this.getScreenResolution();
      const width = match.width
      const height = match.height

      const x1 = Math.floor(width / 2); // Starting x (center)
      const y1 = Math.floor(height * 0.2); // Starting y (20% from top)
      const x2 = Math.floor(width / 2); // Ending x (center)
      const y2 = Math.floor(height * 0.8); // Ending y (80% from top)

      // Perform the swipe
      await this.swipe(x1, y1, x2, y2);
      console.log(`Swiped down from center.`);
    } catch (error) {
      console.error(`Failed to swipe down from center:`, error);
      throw error;
    }
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

  async typeText(text: string, typeNormally = false): Promise<string> {
    if (!typeNormally)
      return this.typeTextViaPaste(text);
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

  // Cleaned and faster version of typeText
  async typeTextCleaned(text: string): Promise<string> {
    // Only allow letters, numbers, . , \n # and space
    const cleaned = text.replace(/[^a-zA-Z0-9.,#\n ]/g, "");
    // Split by newlines to handle \n
    const lines = cleaned.split(/\n/);
    let result = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length > 0) {
        // Type the line in one go
        result += await this.executeCommand(`adb shell input text "${line}"`);
      }
      if (i < lines.length - 1) {
        // Send enter key for newline
        result += await this.executeCommand(`adb shell input keyevent 66`);
      }
    }
    return result;
  }

  async typeTextViaPaste(text = '...') {
    const base64Text = Buffer.from(text, 'utf-8').toString('base64');
    const command = `adb shell su -c "\\\" echo '${base64Text}' | base64 -d | '${termuxClipPath}'\\\""`;
    await this.executeCommand(command);
    return await this.executeCommand(`adb shell input keyevent 279`);
  }


  /**
   * 
   * @param runnable must return a non-null value to mark success, can return a promise
   * @param timeout 
   */
  async waitFor(runnable: () => Promise<any>, timeout: number, pollInterval = 1000, label?: string) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (label) {
        console.log(`Waiting for ${label}...`);
      }
      const result = await runnable();
      if (result) {
        return result;
      }
      await this.sleep(pollInterval);
    }
    if (label) {
      console.log(`waitFor timed out for ${label} after ${timeout}ms`);
    }
    throw new Error(`waitFor timed out after ${timeout}ms`);
  }


  // Find element by attribute
  async findElementByResId(
    resId: string,
    screenJson?: any
  ): Promise<Node> {
    const xml = new XmlUtils();
    if (!screenJson) {
      screenJson = await this.dumpScreenXml();
    }
    xml.xmlJson = screenJson;
    const node = await xml.findNodeByAttr("resource-id", resId);
    if (node) {
      console.log("Found node", `resource-id=${resId}`, '@', node.$.bounds);
      return node;
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
  async dumpScreenXml(dumpFile?: string): Promise<any> {
    try {
      let _tempDump = "/sdcard/window_dump.xml";
      await this.executeCommand(`adb shell su -c "uiautomator dump ${_tempDump}"`);
      console.log("Dumped screen to xml");
      const xmlContent = await this.executeCommand("adb shell cat " + _tempDump);
      console.log("Size of xml:", xmlContent.length, "bytes");
      await this.executeCommand("adb shell rm " + _tempDump);
      fs.writeFileSync(dumpFile || wsdir + "/dump.xml", xmlContent);
      let xml = new XmlUtils(xmlContent);
      return xml.parseXml(xmlContent);
    } catch (error) {
      console.error("Failed to dump XML layout:", error);
      throw error;
    }
  }

  async dumpScreen(targetFile?: string): Promise<string> {
    const dumpPath = path.resolve(targetFile ?? path.join(wsdir, "dump.png"));
    await this.executeCommand(`adb exec-out screencap -p > ${dumpPath}`);
    console.log("Dumped screen to", dumpPath);
    return dumpPath;
  }


  async dumpMarkBounds(node: Node, targetFile?: string) {
    let bounds = node.$.bounds;
    try {
      targetFile = await detectBounds(bounds, targetFile);
      console.log("Captured", bounds, "bounds to ", targetFile);
      return targetFile;
    } catch (error) {
      console.error("Failed to capture bounds:", error);
      throw error;
    }
  }


  /**
   * 
   * @param packageName package name
   * @param intent optional intent, defaults to main launcher
   */
  async startApp(packageName: string, intent?: string) {
    try {
      const command = intent
        ? `adb shell am start -n ${packageName}/${intent}`
        : `adb shell monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`;
      const result = await this.executeCommand(command);
      console.log(`App ${packageName} started successfully.`);
      return result;
    } catch (error) {
      console.error(`Failed to start app ${packageName}:`, error);
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

  async enableApp(packageName: string) {
    try {
      const command = `adb shell su -c "pm enable ${packageName}"`;
      await this.executeCommand(command);
      console.log(`App ${packageName} enabled successfully.`);
    } catch (error) {
      console.error(`Failed to enable app ${packageName}:`, error);
      throw error;
    }
  }

  async disableApp(packageName: string) {
    try {
      const command = `adb shell su -c "pm disable ${packageName}"`;
      await this.executeCommand(command);
      console.log(`App ${packageName} disabled successfully.`);
    } catch (error) {
      console.error(`Failed to disable app ${packageName}:`, error);
      throw error;
    }
  }


  /**
   * 
   * @param brightness 0-100
   */
  async setBrightness(brightnessPercent: number) {
    try {
      const disableAutoBrightness = `adb shell su -c "settings put system screen_brightness_mode 0"`;
      await this.executeCommand(disableAutoBrightness);
      let maxBrightness = 2000;
      let brightness = Math.floor((brightnessPercent / 100) * maxBrightness);
      if (brightness > maxBrightness) {
        brightness = maxBrightness;
      }
      if (brightness <= 0) {
        brightness = 0;
      }
      const command = `adb shell su -c "settings put system screen_brightness ${brightness}"`;
      await this.executeCommand(command);
      console.log(`Brightness set to ${brightness} successfully.`);
    } catch (error) {
      console.error(`Failed to set brightness:`, error);
      throw error;
    }
  }

  // Turn on the screen
  async turnOnScreen(): Promise<void> {
    await this.executeCommand("adb shell input keyevent KEYCODE_WAKEUP");
    await this.executeCommand("adb shell input keyevent KEYCODE_MENU");
  }
  // Turn on the screen
  async wakeup(): Promise<void> {
    return this.turnOnScreen()
  }

  async turnOffScreen(): Promise<void> {
    await this.executeCommand("adb shell input keyevent 26");
  }

  // Check if the screen is on
  isScreenOn(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.executeCommand(
        `adb shell su -c "dumpsys power | grep mHalInteractiveModeEnabled"`
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
