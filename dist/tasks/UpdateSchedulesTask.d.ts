import { MultiDbORM } from 'multi-db-orm';
import PipeLane, { PipeTask, PipeTaskDescription } from 'pipelane';
interface FetchSchedulesTaskInputs {
    last: {
        id: string;
        status: boolean;
    }[];
    additionalInputs: {};
}
export declare class UpdateSchedulesTask extends PipeTask<any, any> {
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
