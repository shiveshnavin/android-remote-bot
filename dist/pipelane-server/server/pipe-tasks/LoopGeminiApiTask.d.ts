import PipeLane, { PipeTask } from "pipelane";
type InputPart = {
    text?: string;
    fileData?: {
        mimeType: string;
        localFileUri?: string;
        fileUri?: string;
    };
};
export type GeminiApiTaskInput = {
    additionalInputs?: {
        parts: InputPart[];
    };
    last?: {
        parts: InputPart[];
    }[];
};
export declare class LoopGeminiApiTask extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string;
    static TASK_TYPE_NAME: string;
    fileManager: any;
    model: any;
    apiKey: string;
    constructor(variantName?: string, apiKey?: string);
    kill(): boolean;
    init(): Promise<void>;
    uploadToGemini(path: any, mimeType: any): Promise<{
        uri: string;
        mimeType: string;
    }>;
    private callGemini;
    execute(pipeWorksInstance: PipeLane, data: GeminiApiTaskInput): Promise<any[]>;
}
export {};
