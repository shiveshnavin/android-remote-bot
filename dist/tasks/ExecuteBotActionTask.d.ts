import { PipeTaskDescription } from 'pipelane';
import { LoopEvaluateJsTask } from '../pipelane-server/server/pipe-tasks/LoopEvaluateJsTask';
import { AndroidBot } from '../bot';
import moment from 'moment';
export declare class ExecuteBotActionTask extends LoopEvaluateJsTask {
    static TASK_VARIANT_NAME: string;
    bot: AndroidBot;
    constructor(bot: AndroidBot);
    kill(): boolean;
    describe(): PipeTaskDescription | undefined;
    evalInScope(js: any, pl: any, input: any, prev: any, axios: any, Utils?: {
        fs: typeof import("fs");
        getXmlParser(): import("fast-xml-parser").XMLParser;
        xml2json(xmlText: string): any;
        mkdir(path: string): void;
        escapeJSONString(str: string): string;
        randomElement<T>(arr: T[]): T;
        generateUID(input: string, length?: number): string;
        generateHashCode(input: string, maxValue?: number): number;
        extractEnclosedObjString(inputString: any): any;
        extractJsonFromMarkdown(str: any): any;
        extractCodeFromMarkdown(markdown: any): any[];
        shuffleArray(array: any): any;
        refineString(str: any, replacementChar?: string): any;
        generateRandomID(length?: number): string;
        getFileNameFromURL(url: string): string;
        decodeBase64(base64: string): string;
        getMoment(): typeof moment;
        formatDate(date: Date, format: string): string;
        encodeBase64(normalString: string): string;
        sleep(ms: any): Promise<unknown>;
    }, bot?: AndroidBot): Promise<any>;
}
