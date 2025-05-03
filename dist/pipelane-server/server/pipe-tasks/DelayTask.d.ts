import PipeLane, { InputWithPreviousInputs, PipeTask } from "pipelane";
export declare class DelayTask extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string;
    static TASK_TYPE_NAME: string;
    timeoutId: any;
    constructor(variantName?: string);
    kill(): boolean;
    execute(pipeWorksInstance: PipeLane, input: InputWithPreviousInputs): Promise<any[]>;
}
