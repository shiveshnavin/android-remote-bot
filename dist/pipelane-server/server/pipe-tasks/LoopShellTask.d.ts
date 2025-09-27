import PipeLane, { PipeTaskDescription } from "pipelane";
import { ShellTask } from "./ShellTask";
export type ShellTaskAdditionalInput = {
    cmd: string;
};
export declare class LoopShellTask extends ShellTask {
    static TASK_VARIANT_NAME: string;
    static TASK_TYPE_NAME: string;
    allowedCommands: any[];
    constructor(variantName?: string, allowedCommands?: string[]);
    kill(): boolean;
    describe(): PipeTaskDescription | undefined;
    isExecutableAllowed(command: any, allowedExecutables: any): boolean;
    execute(pipeWorksInstance: PipeLane, input: {
        last: any[];
        additionalInputs: {
            cmd?: string;
            sequential?: boolean;
            rate?: number;
            interval?: any;
        };
    }): Promise<any[]>;
}
