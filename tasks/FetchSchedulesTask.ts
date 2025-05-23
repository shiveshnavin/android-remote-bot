import { MultiDbORM } from 'multi-db-orm';
import PipeLane, { PipeTask, PipeTaskDescription } from 'pipelane';

interface FetchSchedulesTaskInputs {
    additionalInputs: {
        subType: string;
        limit: number;
        tenant: string;
    };
}

export class FetchSchedulesTask extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string = 'fetch-schedules';
    static TASK_TYPE_NAME: string = 'fetch-schedules';

    private db: MultiDbORM;
    private tableName = 'smauto_posts_schedule_android_bot';

    constructor(db?: MultiDbORM) {
        super(FetchSchedulesTask.TASK_TYPE_NAME, FetchSchedulesTask.TASK_VARIANT_NAME);
        if (!db) {
            throw new Error('Must provide `db` for task `FetchSchedulesTask`');
        }
        this.db = db;
    }

    kill(): boolean {
        return true;
    }

    describe(): PipeTaskDescription | undefined {
        return {
            summary: 'Fetches scheduled media items based on subType and limit.',
            inputs: {
                last: [],
                additionalInputs: {
                    tenant: 'string, Username',
                    subType: 'string, The subType of media to fetch.',
                    limit: 'number, The maximum number of videos to fetch.',
                },
            },
        };
    }

    async execute(
        pipeWorksInstance: PipeLane,
        input: FetchSchedulesTaskInputs
    ): Promise<any[]> {
        try {
            const { subType, limit, tenant } = input.additionalInputs;
            if (!subType) {
                return [{
                    status: false,
                    message: 'subType is required'
                }]
            }
            const filter: any = { status: 'SCHEDULED', type: "ig_android_bot_post", subType: subType };
            if (tenant) {
                filter.tenant = tenant
            }
            const options: any = {
                apply: {
                    field: 'nextTimeStamp',
                    sort: 'asc'
                },
                limit: limit || 1
            }

            const result = await this.db.get(this.tableName, filter, options);
            if (!result || result.length == 0) {
                return [{
                    status: false,
                    message: 'No schedules found'
                }]
            }
            return result;
        } catch (error) {
            this.onLog(`Error fetching schedules: ${error.message}`);
            return [{
                status: false,
                message: `Error fetching schedules: ${error.message}`
            }];
        }
    }
}