import PipeLane, { PipeTask } from "pipelane";
export declare class ApiTask extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string;
    static TASK_TYPE_NAME: string;
    constructor(variantName?: string);
    kill(): boolean;
    execute(pipeWorksInstance: PipeLane, input: any): Promise<any[]>;
}
