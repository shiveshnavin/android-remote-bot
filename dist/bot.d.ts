import { Node } from "./xml";
export declare class AndroidBot {
    startCopyClip(): Promise<void>;
    isConnected(): Promise<boolean>;
    connectToDevice(): Promise<void>;
    setVolumeToZero(): Promise<void>;
    setVolumeToMax(): Promise<void>;
    killApp(pkg: string): Promise<void>;
    hideKeyboardIfVisible(tryHideKeyboardTries?: number): Promise<void>;
    isKeyboardVisible(): Promise<boolean>;
    shareVideoById(mediaId: string, targetActivity: string): Promise<void>;
    scanFile(filePath: string): Promise<void>;
    getMediaIdFromPath(filePath: string): Promise<string>;
    pressBackKey(strokes?: number): Promise<void>;
    pressEnterKey(): Promise<void>;
    sleep(ms: number): Promise<void>;
    swipe(x1: number, y1: number, x2: number, y2: number, duration?: number): Promise<void>;
    getScreenResolution(): Promise<{
        width: number;
        height: number;
    }>;
    swipeRightFromCenter(): Promise<void>;
    swipeLeftFromCenter(): Promise<void>;
    swipeUpFromCenter(): Promise<void>;
    swipeDownFromCenter(): Promise<void>;
    dismissBottomSheetIfPresent(screenJson: any): Promise<void>;
    clickAtTopCenter(): Promise<void>;
    clearInputField(strokes: number): Promise<void>;
    typeText(text: string): Promise<string>;
    typeTextCleaned(text: string): Promise<string>;
    typeTextViaPaste(text?: string): Promise<string>;
    /**
     *
     * @param runnable must return a non-null value to mark success, can return a promise
     * @param timeout
     */
    waitFor(runnable: () => Promise<any>, timeout: number, pollInterval?: number, label?: string): Promise<any>;
    findElementByAttribute(attr: string, value: string, screenJson?: any): Promise<Node>;
    findElementByLabel(label: string, screenJson?: any): Promise<Node>;
    clickAndHoldNode(node: Node, durationMs: number): Promise<void>;
    clickNode(node: Node): Promise<void>;
    clickAndHold(x: number, y: number, durationMs: number): Promise<any>;
    clickAt(x: number, y: number): Promise<any>;
    dumpScreenXml(dumpFile?: string): Promise<any>;
    /**
     *
     * @param packageName package name
     * @param intent optional intent, defaults to main launcher
     */
    startApp(packageName: string, intent?: string): Promise<string>;
    openActivity(activityName: string): Promise<any>;
    enableApp(packageName: string): Promise<void>;
    disableApp(packageName: string): Promise<void>;
    turnOnScreen(): Promise<void>;
    wakeup(): Promise<void>;
    turnOffScreen(): Promise<void>;
    isScreenOn(): Promise<boolean>;
    executeCommand(command: string): Promise<string>;
}
