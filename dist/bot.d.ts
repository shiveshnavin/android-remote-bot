import { Node } from "./xml";
export declare class AndroidBot {
    setVolumeToZero(): Promise<void>;
    setVolumeToMax(): Promise<void>;
    killApp(pkg: string): Promise<void>;
    hideKeyboardIfVisible(): Promise<void>;
    isKeyboardVisible(): Promise<boolean>;
    shareVideoById(mediaId: string, targetActivity: string): Promise<void>;
    scanFile(filePath: string): Promise<void>;
    getMediaIdFromPath(filePath: string): Promise<string>;
    pressBackKey(strokes?: number): Promise<void>;
    pressEnterKey(): Promise<void>;
    sleep(ms: number): Promise<void>;
    dismissBottomSheetIfPresent(screenJson: any): Promise<void>;
    clickAtTopCenter(): Promise<void>;
    clearInputField(strokes: number): Promise<void>;
    typeText(text: string): Promise<string>;
    findElementByAttribute(attr: string, value: string, screenJson?: any): Promise<Node>;
    findElementByLabel(label: string, screenJson?: any): Promise<Node>;
    clickAndHoldNode(node: Node, durationMs: number): Promise<void>;
    clickNode(node: Node): Promise<void>;
    clickAndHold(x: number, y: number, durationMs: number): Promise<any>;
    clickAt(x: number, y: number): Promise<any>;
    dumpScreenXml(): Promise<any>;
    openActivity(activityName: string): Promise<any>;
    turnOnScreen(): Promise<void>;
    turnOffScreen(): Promise<void>;
    isScreenOn(): Promise<boolean>;
    executeCommand(command: string): Promise<string>;
    connectToDevice(): Promise<void>;
}
