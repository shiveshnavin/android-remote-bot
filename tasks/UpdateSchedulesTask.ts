import { MultiDbORM } from 'multi-db-orm';
import PipeLane, { PipeTask, PipeTaskDescription } from 'pipelane';

interface FetchSchedulesTaskInputs {
    last: { id: string, status: boolean }[]
    additionalInputs: {

    };
}

export class UpdateSchedulesTask extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string = 'update-schedules';
    static TASK_TYPE_NAME: string = 'update-schedules';

    private db: MultiDbORM;
    private tableName = 'smauto_posts_schedule_android_bot';

    constructor(db?: MultiDbORM) {
        super(UpdateSchedulesTask.TASK_TYPE_NAME, UpdateSchedulesTask.TASK_VARIANT_NAME);
        if (!db) {
            throw new Error('Must provide `db` for task `UpdateSchedulesTask`');
        }
        this.db = db;
    }

    kill(): boolean {
        return true;
    }

    describe(): PipeTaskDescription | undefined {
        return {
            summary: 'Update scheduled media items based on id.',
            inputs: {
                last: [{
                    id: "string"
                }],
                additionalInputs: {

                },
            },
        };
    }

    async execute(
        pipeWorksInstance: PipeLane,
        input: FetchSchedulesTaskInputs
    ): Promise<any[]> {
        try {
            for (let item of input.last) {
                let status = item.status ? 'COMPLETED' : 'FAILED'
                const result = await this.db.update(this.tableName, { id: item.id }, { status });
            }
        } catch (error) {
            this.onLog(`Error updating schedules: ${error.message}`);
            return [{
                status: false,
                message: `Error updating schedules: ${error.message}`
            }];
        }

        return input.last
    }
}