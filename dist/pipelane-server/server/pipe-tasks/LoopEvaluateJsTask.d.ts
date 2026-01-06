import PipeLane, { PipeTaskDescription } from "pipelane";
import { EvaluateJsTask, EvaluateJsTaskInput } from "./EvaluateJsTask";
export declare class LoopEvaluateJsTask extends EvaluateJsTask {
    static TASK_VARIANT_NAME: string;
    constructor(variantName?: string);
    describe(): PipeTaskDescription | undefined;
    /**
     *
     * @param pipeWorksInstance
     * @param input { additionalInputs: {js} }, No need to enclose js in this input with ${} as it is           understood that the value of field js is a javascript string
     * @returns
     */
    execute(pipeWorksInstance: PipeLane, input: EvaluateJsTaskInput): Promise<any[]>;
}
