import PipeLane, { PipeTask } from "pipelane";
export declare class WriteCsvFileTask extends PipeTask<any, any> {
    static TASK_TYPE_NAME: string;
    static TASK_VARIANT_NAME: string;
    constructor(variantName?: string);
    kill(): boolean;
    execute(pipeWorksInstance: PipeLane, inputs: any): Promise<any[]>;
}
