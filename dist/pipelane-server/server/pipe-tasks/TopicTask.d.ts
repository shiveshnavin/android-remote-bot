import { MultiDbORM } from "multi-db-orm";
import PipeLane, { InputWithPreviousInputs, PipeTask, PipeTaskDescription, OutputWithStatus } from "pipelane";
export type Topic = {
    id: string;
    priority: number;
    state: "completed" | "failed" | "in_progress" | "scheduled" | "pending_approval";
    updatedTimestamp: number;
    createdTimestamp: number;
    queue: string;
};
export declare class TopicTask extends PipeTask<InputWithPreviousInputs, OutputWithStatus> {
    kill(): boolean;
    static TASK_TYPE_NAME: string;
    static VARIANT_READ: string;
    static VARIANT_WRITE: string;
    tableName: any;
    private db;
    private initialized;
    constructor(variantName: string, db?: MultiDbORM, tableName?: string);
    initDb(): Promise<void>;
    describe(): PipeTaskDescription | undefined;
    execute(pipeWorksInstance: PipeLane, input: {
        last?: any[];
        additionalInputs?: any;
    }): Promise<any[]>;
}
