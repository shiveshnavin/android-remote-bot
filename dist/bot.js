"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AndroidBot = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const xml_1 = require("./xml");
console.log("Android BOT");
let wsdir = "./workspace";
if (!fs_1.default.existsSync(wsdir)) {
    fs_1.default.mkdirSync(wsdir);
}
class AndroidBot {
    // Method to kill app by package name
    async killApp(pkg) {
        await this.executeCommand(`adb shell am force-stop ${pkg}`);
        console.log("killed app ", pkg);
    }
    // Method to hide keyboard if it's visible
    async hideKeyboardIfVisible() {
        try {
            const keyboardVisible = await this.isKeyboardVisible();
            if (keyboardVisible) {
                console.log("Keyboard is visible, pressing back button...");
                await this.executeCommand("adb shell input keyevent KEYCODE_BACK");
            }
            else {
                console.log("Keyboard is not visible.");
            }
        }
        catch (error) {
            console.error("Failed to check or hide keyboard:", error);
        }
    }
    // Method to check if keyboard is visible
    async isKeyboardVisible() {
        try {
            const output = await this.executeCommand('adb shell dumpsys input_method | grep -i "mInputShown"');
            return output.includes("mInputShown=true");
        }
        catch (error) {
            console.error("Error checking keyboard visibility:", error);
            return false;
        }
    }
    // Method to share video by media ID
    async shareVideoById(mediaId, targetActivity) {
        try {
            const shareCommand = ` adb shell am start -a android.intent.action.SEND   -t video/*   --eu android.intent.extra.STREAM content://media/external/video/media/${mediaId}   -n ${targetActivity}   --grant-read-uri-permission`;
            await this.executeCommand(shareCommand);
            console.log(`Successfully shared media ${mediaId} to ${targetActivity}.`);
        }
        catch (error) {
            console.error("Failed to share media:", error);
            throw error;
        }
    }
    // Method to scan a file and add it to the media database
    async scanFile(filePath) {
        try {
            const command = `adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file://${filePath}`;
            await this.executeCommand(command);
            console.log(`File ${filePath} has been scanned and added to media database.`);
        }
        catch (error) {
            console.error("Failed to scan file:", error);
            throw error;
        }
    }
    // Method to get media ID from file path
    async getMediaIdFromPath(filePath) {
        try {
            const fileName = path_1.default.basename(filePath);
            const queryCommand = `adb shell content query --uri content://media/external/video/media --projection _id:_data | grep '${fileName}'`;
            const result = await this.executeCommand(queryCommand);
            const mediaIdMatch = result.match(/_id=(\d+)/);
            if (mediaIdMatch) {
                const mediaId = mediaIdMatch[1];
                return mediaId;
            }
            else {
                throw new Error(`No media found for path: ${filePath}`);
            }
        }
        catch (error) {
            console.error("Failed to get media ID:", error);
            throw error;
        }
    }
    // Method to simulate back key press
    async pressBackKey(strokes = 1) {
        const keyEvents = Array(strokes).fill("4").join(" ");
        const command = "adb shell input keyevent " + keyEvents;
        await this.executeCommand(command);
    }
    // Method to simulate enter key press
    async pressEnterKey() {
        const command = "adb shell input keyevent 66";
        await this.executeCommand(command);
    }
    // Sleep method
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    // Clear input field by simulating backspace key presses
    async clearInputField(strokes) {
        const keyEvents = Array(strokes).fill("67").join(" ");
        const command = `adb shell input keyevent ${keyEvents}`;
        await this.executeCommand(command);
    }
    async typeText(text) {
        try {
            const parts = text.split(/(\n|\t|\[|\]|\{|\}|\(|\)| )/);
            let result = '';
            for (const part of parts) {
                if (part === '') {
                    continue;
                }
                else if (part === '\n') {
                    result += await this.executeCommand(`adb shell input keyevent 66`); // KEYCODE_ENTER
                }
                else if (part === '\t') {
                    result += await this.executeCommand(`adb shell input keyevent 61`); // KEYCODE_TAB
                }
                else if (part === '[') {
                    // Handle left bracket character
                    result += await this.executeCommand(`adb shell input keyevent 71`); // KEYCODE_LEFT_BRACKET
                }
                else if (part === ']') {
                    // Handle right bracket character
                    result += await this.executeCommand(`adb shell input keyevent 72`); // KEYCODE_RIGHT_BRACKET
                }
                else if (part === '{') {
                    // Handle left brace character
                    result += await this.executeCommand(`adb shell input keyevent 73`); // KEYCODE_LEFT_BRACE
                }
                else if (part === '}') {
                    // Handle right brace character
                    result += await this.executeCommand(`adb shell input keyevent 74`); // KEYCODE_RIGHT_BRACE
                }
                else if (part === '(') {
                    // Handle left parenthesis character
                    result += await this.executeCommand(`adb shell input keyevent 75`); // KEYCODE_LEFT_PARENTHESIS
                }
                else if (part === ')') {
                    // Handle right parenthesis character
                    result += await this.executeCommand(`adb shell input keyevent 76`); // KEYCODE_RIGHT_PARENTHESIS
                }
                else if (part === ' ') {
                    // Handle space character using keyevent (replacing the old %s logic)
                    result += await this.executeCommand(`adb shell input keyevent 62`); // KEYCODE_SPACE
                }
                else {
                    const safeText = part
                        .replace(/(["\\$`])/g, "\\$1");
                    if (safeText.length > 0) {
                        const command = `adb shell input text "${safeText}"`;
                        result += await this.executeCommand(command);
                    }
                }
            }
            console.log(`Finished typing text: "${text}"`); // Log the original text
            return result;
        }
        catch (error) {
            console.error(`Failed to type text "${text}":`, error);
            throw error;
        }
    }
    // Find element by attribute
    async findElementByAttribute(attr, value, screenJson) {
        const xml = new xml_1.XmlUtils();
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
    // Find element by label
    async findElementByLabel(label, screenJson) {
        const xml = new xml_1.XmlUtils();
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
    async clickAndHoldNode(node, durationMs) {
        const xml = new xml_1.XmlUtils();
        const bounds = xml.getBounds(node);
        await this.clickAndHold(bounds.x, bounds.y, durationMs);
    }
    async clickNode(node) {
        const xml = new xml_1.XmlUtils();
        const bounds = xml.getBounds(node);
        await this.clickAt(bounds.x, bounds.y);
    }
    async clickAndHold(x, y, durationMs) {
        try {
            const command = `adb shell input swipe ${x} ${y} ${x} ${y} ${durationMs}`;
            const result = await this.executeCommand(command);
            console.log(`Tap and Hold at coordinates: x=${x}, y=${y}`);
            return result;
        }
        catch (error) {
            console.error(`Failed to Tap and Hold at coordinates x=${x}, y=${y}:`, error);
            throw error;
        }
    }
    async clickAt(x, y) {
        try {
            const command = `adb shell input tap ${x} ${y}`;
            const result = await this.executeCommand(command);
            console.log(`Clicked at coordinates: x=${x}, y=${y}`);
            return result;
        }
        catch (error) {
            console.error(`Failed to click at coordinates x=${x}, y=${y}:`, error);
            throw error;
        }
    }
    // Dump screen XML layout
    async dumpScreenXml() {
        try {
            let dumpFile = "/sdcard/window_dump.xml";
            await this.executeCommand("adb shell uiautomator dump " + dumpFile);
            const xmlContent = await this.executeCommand("adb shell cat " + dumpFile);
            fs_1.default.writeFileSync("dump.xml", xmlContent);
            let xml = new xml_1.XmlUtils(xmlContent);
            return xml.parseXml(xmlContent);
        }
        catch (error) {
            console.error("Failed to dump XML layout:", error);
            throw error;
        }
    }
    // Open a specific activity
    async openActivity(activityName) {
        try {
            const command = `adb shell am start -n ${activityName}`;
            const result = await this.executeCommand(command);
            console.log(`Activity ${activityName} opened successfully`);
            return result;
        }
        catch (error) {
            if (error.message.includes("intent has been delivered to currently running top-most instance")) {
                return;
            }
            console.error(`Failed to open activity ${activityName}:`, error);
            throw error;
        }
    }
    // Turn on the screen
    async turnOnScreen() {
        await this.executeCommand("adb shell input keyevent KEYCODE_WAKEUP");
        await this.executeCommand("adb shell input keyevent KEYCODE_MENU");
    }
    async turnOffScreen() {
        await this.executeCommand("adb shell input keyevent 26");
    }
    // Check if the screen is on
    isScreenOn() {
        return new Promise((resolve, reject) => {
            return this.executeCommand("su -c dumpsys power | grep mHalInteractiveModeEnabled").then((stdout) => {
                const screenIsOn = stdout.includes("mHalInteractiveModeEnabled=true");
                resolve(screenIsOn);
            }).catch(reject);
        });
    }
    // Execute adb command
    executeCommand(command) {
        console.log("exec: " + command);
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
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
exports.AndroidBot = AndroidBot;
const bot = new AndroidBot();
// bot.turnOnScreen().then(console.log);
