import PipeLane, { InputWithPreviousInputs, OutputWithStatus, PipeTask, PipeTaskDescription } from "pipelane";
export type EvaluateJsTaskInput = InputWithPreviousInputs & {
    last: OutputWithStatus[];
    additionalInputs: {
        js: string;
    };
};
export declare const EvalJSUtils: {
    mkdir(path: string): void;
    escapeJSONString(str: string): string;
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
        mkdir(path: string): void;
        escapeJSONString(str: string): string;
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
