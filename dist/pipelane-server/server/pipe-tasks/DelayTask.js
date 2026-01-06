"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelayTask = void 0;
const pipelane_1 = require("pipelane");
class DelayTask extends pipelane_1.PipeTask {
    static TASK_VARIANT_NAME = "delay";
    static TASK_TYPE_NAME = "delay";
    timeoutId;
    constructor(variantName) {
        super(DelayTask.TASK_TYPE_NAME, variantName || DelayTask.TASK_VARIANT_NAME);
    }
    kill() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        return true;
    }
    describe() {
        return {
            summary: "Delays execution for the specified period",
            inputs: {
                additionalInputs: {
                    milis: "number, the period to wait for in milis"
                },
                last: []
            }
        };
    }
    async execute(pipeWorksInstance, input) {
        if (!input.additionalInputs.milis) {
            return [{
                    status: false,
                    message: 'invalid input. required feild `milis` missing'
                }];
        }
        return await new Promise((resolve) => {
            this.timeoutId = setTimeout(() => {
                if (!input.additionalInputs.last)
                    resolve([{
                            status: true
                        }]);
                else
                    resolve(input.last);
            }, input.additionalInputs.milis);
        });
    }
}
exports.DelayTask = DelayTask;
