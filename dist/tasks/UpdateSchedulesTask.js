"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSchedulesTask = void 0;
const pipelane_1 = require("pipelane");
class UpdateSchedulesTask extends pipelane_1.PipeTask {
    static TASK_VARIANT_NAME = 'update-schedules';
    static TASK_TYPE_NAME = 'update-schedules';
    db;
    tableName = 'smauto_posts_schedule_android_bot';
    constructor(db) {
        super(UpdateSchedulesTask.TASK_TYPE_NAME, UpdateSchedulesTask.TASK_VARIANT_NAME);
        if (!db) {
            throw new Error('Must provide `db` for task `UpdateSchedulesTask`');
        }
        this.db = db;
    }
    kill() {
        return true;
    }
    describe() {
        return {
            summary: 'Update scheduled media items based on id.',
            inputs: {
                last: [{
                        id: "string"
                    }],
                additionalInputs: {},
            },
        };
    }
    async execute(pipeWorksInstance, input) {
        try {
            for (let item of input.last) {
                let status = item.status ? 'COMPLETED' : 'FAILED';
                const result = await this.db.update(this.tableName, { id: item.id }, { status });
            }
        }
        catch (error) {
            this.onLog(`Error updating schedules: ${error.message}`);
            return [{
                    status: false,
                    message: `Error updating schedules: ${error.message}`
                }];
        }
        return input.last;
    }
}
exports.UpdateSchedulesTask = UpdateSchedulesTask;
