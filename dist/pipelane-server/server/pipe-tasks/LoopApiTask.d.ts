import PipeLane, { PipeTask, PipeTaskDescription } from "pipelane";
export declare class LoopApiTask extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string;
    static TASK_TYPE_NAME: string;
    constructor(variantName?: string);
    kill(): boolean;
    describe(): PipeTaskDescription | undefined;
    execute(pipeWorksInstance: PipeLane, inputs: any): Promise<any[]>;
}
