"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchSchedulesTask = void 0;
const pipelane_1 = require("pipelane");
class FetchSchedulesTask extends pipelane_1.PipeTask {
    static TASK_VARIANT_NAME = 'fetch-schedules';
    static TASK_TYPE_NAME = 'fetch-schedules';
    db;
    tableName = 'smauto_posts_schedule_android_bot';
    constructor(db) {
        super(FetchSchedulesTask.TASK_TYPE_NAME, FetchSchedulesTask.TASK_VARIANT_NAME);
        if (!db) {
            throw new Error('Must provide `db` for task `FetchSchedulesTask`');
        }
        this.db = db;
    }
    kill() {
        return true;
    }
    describe() {
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
    async execute(pipeWorksInstance, input) {
        try {
            const { subType, limit, tenant } = input.additionalInputs;
            if (!subType) {
                return [{
                        status: false,
                        message: 'subType is required'
                    }];
            }
            const filter = { status: 'SCHEDULED', type: "ig_android_bot_post", subType: subType };
            if (tenant) {
                filter.tenant = tenant;
            }
            const options = {
                apply: {
                    field: 'nextTimeStamp',
                    sort: 'asc'
                },
                limit: limit || 1
            };
            const result = await this.db.get(this.tableName, filter, options);
            if (!result || result.length == 0) {
                return [{
                        status: false,
                        message: 'No schedules found'
                    }];
            }
            return result;
        }
        catch (error) {
            this.onLog(`Error fetching schedules: ${error.message}`);
            return [{
                    status: false,
                    message: `Error fetching schedules: ${error.message}`
                }];
        }
    }
}
exports.FetchSchedulesTask = FetchSchedulesTask;
