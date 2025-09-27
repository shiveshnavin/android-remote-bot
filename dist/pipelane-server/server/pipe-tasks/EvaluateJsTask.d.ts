import fs from 'fs';
import PipeLane, { InputWithPreviousInputs, OutputWithStatus, PipeTask, PipeTaskDescription } from "pipelane";
import moment from 'moment';
import { XMLParser } from "fast-xml-parser";
export type EvaluateJsTaskInput = InputWithPreviousInputs & {
    last: OutputWithStatus[];
    additionalInputs: {
        js: string;
    };
};
export declare const EvalJSUtils: {
    fs: typeof fs;
    getXmlParser(): XMLParser;
    xml2json(xmlText: string): any;
    mkdir(path: string): void;
    escapeJSONString(str: string): string;
    randomElement<T>(arr: T[]): T;
    generateUID(input: string): string;
    extractEnclosedObjString(inputString: any): any;
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
};
/**
 * Deprecated. Use LoopEvaluateJsTask instead
 */
export declare class EvaluateJsTask extends PipeTask<EvaluateJsTaskInput, any> {
    static TASK_VARIANT_NAME: string;
    static TASK_TYPE_NAME: string;
    timeoutId: any;
    constructor(variantName?: string);
    kill(): boolean;
    describe(): PipeTaskDescription | undefined;
    evalInScope(js: any, pl: any, input: any, prev: any, axios: any, Utils?: {
        fs: typeof fs;
        getXmlParser(): XMLParser;
        xml2json(xmlText: string): any;
        mkdir(path: string): void;
        escapeJSONString(str: string): string;
        randomElement<T>(arr: T[]): T;
        generateUID(input: string): string;
        extractEnclosedObjString(inputString: any): any;
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
    }): Promise<any>;
    /**
     *
     * @param pipeWorksInstance
     * @param input { additionalInputs: {js} }, No need to enclose js in this input with ${} as it is           understood that the value of field js is a javascript string
     * @returns
     */
    execute(pipeWorksInstance: PipeLane, input: EvaluateJsTaskInput): Promise<any[]>;
    evaluatePlaceholdersInString(pl: PipeLane, input: InputWithPreviousInputs, jsInputString: string): Promise<string | undefined>;
}
