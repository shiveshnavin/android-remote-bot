import { MultiDbORM } from 'multi-db-orm';
import PipeLane, { PipeTask, PipeTaskDescription } from 'pipelane';
interface FetchSchedulesTaskInputs {
    additionalInputs: {
        subType: string;
        limit: number;
        tenant: string;
    };
}
export declare class FetchSchedulesTask extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string;
    static TASK_TYPE_NAME: string;
    private db;
    private tableName;
    constructor(db?: MultiDbORM);
    kill(): boolean;
    describe(): PipeTaskDescription | undefined;
    execute(pipeWorksInstance: PipeLane, input: FetchSchedulesTaskInputs): Promise<any[]>;
}
export {};
