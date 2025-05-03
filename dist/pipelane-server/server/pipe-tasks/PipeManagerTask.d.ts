import PipeLane, { PipeTask } from "pipelane";
export type PipeManagerInput = {
    pipeName: string;
    action: "enable" | "disable" | "delete" | "trigger";
    access_token: string;
    status: boolean;
    trigger_inputs?: any;
    endpoint: string;
    message?: string;
};
export declare class PipeManagerTask extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string;
    static TASK_TYPE_NAME: string;
    constructor(variantName?: string);
    kill(): boolean;
    getConfig(pipe: PipeManagerInput): any;
    execute(pipeWorksInstance: PipeLane, input: any): Promise<any[]>;
}
