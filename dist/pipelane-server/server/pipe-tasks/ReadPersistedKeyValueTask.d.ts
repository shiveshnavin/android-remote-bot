import { MultiDbORM } from "multi-db-orm";
import PipeLane, { PipeTask, PipeTaskDescription } from "pipelane";
import { PersistedKeyValue } from "./PersistKeyValueTask";
export declare class ReadPersistedKeyValueTask extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string;
    static TASK_TYPE_NAME: string;
    private db;
    tableName: string;
    private initialized;
    constructor(variantName?: string, db?: MultiDbORM);
    kill(): boolean;
    initDb(): Promise<any>;
    describe(): PipeTaskDescription | undefined;
    execute(pipeWorksInstance: PipeLane, input: {
        last: PersistedKeyValue[] | any[];
        additionalInputs: PersistedKeyValue;
    }): Promise<any[]>;
}
