import PipeLane, { PipeTask } from "pipelane";
export type ShellTaskAdditionalInput = {
    cmd: string;
};
export declare class ShellTask extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string;
    static TASK_TYPE_NAME: string;
    allowedCommands: any[];
    constructor(variantName?: string, allowedCommands?: string[]);
    kill(): boolean;
    isExecutableAllowed(command: any, allowedExecutables: any): boolean;
    execute(pipeWorksInstance: PipeLane, input: {
        inputs: any[];
        additionalInputs: ShellTaskAdditionalInput;
    }): Promise<any[]>;
}
