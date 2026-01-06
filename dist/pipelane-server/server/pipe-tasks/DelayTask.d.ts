import PipeLane, { InputWithPreviousInputs, PipeTask, PipeTaskDescription } from "pipelane";
export declare class DelayTask extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string;
    static TASK_TYPE_NAME: string;
    timeoutId: any;
    constructor(variantName?: string);
    kill(): boolean;
    describe(): PipeTaskDescription | undefined;
    execute(pipeWorksInstance: PipeLane, input: InputWithPreviousInputs): Promise<any[]>;
}
