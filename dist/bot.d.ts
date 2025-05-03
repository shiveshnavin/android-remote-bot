export declare class AndroidBot {
    killApp(pkg: string): Promise<void>;
    hideKeyboardIfVisible(): Promise<void>;
    isKeyboardVisible(): Promise<boolean>;
    shareVideoById(mediaId: string, targetActivity: string): Promise<void>;
    scanFile(filePath: string): Promise<void>;
    getMediaIdFromPath(filePath: string): Promise<string>;
    pressBackKey(): Promise<void>;
    pressEnterKey(): Promise<void>;
    sleep(ms: number): Promise<void>;
    clearInputField(strokes: number): Promise<void>;
    typeText(text: string): Promise<string>;
    findElementByAttribute(attr: string, value: string, screenJson?: any): Promise<any>;
    findElementByLabel(label: string, screenJson?: any): Promise<any>;
    clickNode(node: any): Promise<void>;
    clickAt(x: number, y: number): Promise<any>;
    dumpScreenXml(): Promise<any>;
    openActivity(activityName: string): Promise<any>;
    turnOnScreen(): Promise<void>;
    isScreenOn(): Promise<boolean>;
    executeCommand(command: string): Promise<string>;
}
