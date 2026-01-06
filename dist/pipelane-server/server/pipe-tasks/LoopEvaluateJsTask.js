"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopEvaluateJsTask = void 0;
const axios_1 = __importDefault(require("axios"));
const pipelane_1 = __importDefault(require("pipelane"));
const EvaluateJsTask_1 = require("./EvaluateJsTask");
class LoopEvaluateJsTask extends EvaluateJsTask_1.EvaluateJsTask {
    static TASK_VARIANT_NAME = "loop-eval-js";
    constructor(variantName) {
        super(variantName || LoopEvaluateJsTask.TASK_VARIANT_NAME);
    }
    describe() {
        return {
            summary: "Process last output using JS. Must return in format [{status:true}]",
            inputs: {
                additionalInputs: {
                    js: `// available variables: js, pl, input, prev, axios, Utils = EvalJSUtils
async function run(){
console.log(pl.inputs);
//must return an array in output
return [{status:true, pl_inputs:pl.inputs}];
}
run();
`
                },
                last: [{
                        status: true
                    }]
            }
        };
    }
    /**
     *
     * @param pipeWorksInstance
     * @param input { additionalInputs: {js} }, No need to enclose js in this input with ${} as it is           understood that the value of field js is a javascript string
     * @returns
     */
    async execute(pipeWorksInstance, input) {
        if (!input.additionalInputs.js) {
            return [{
                    status: false,
                    message: 'invalid input. required field `js` in additionalInputs  missing'
                }];
        }
        let js = input.additionalInputs.js;
        let prev = input.last;
        try {
            let output = await this.evalInScope(js, pipeWorksInstance, input, prev, axios_1.default);
            if (output == undefined || output.length == undefined) {
                return [{
                        status: false,
                        output,
                        message: 'The output must be an array in format [{status:true}]'
                    }];
            }
            return output;
        }
        catch (e) {
            return [{
                    status: false,
                    error: e.message,
                    stack: JSON.stringify(e.stack || '').substring(0, 100)
                }];
        }
    }
}
exports.LoopEvaluateJsTask = LoopEvaluateJsTask;
const cut = new EvaluateJsTask_1.EvaluateJsTask();
function test() {
    cut.execute(new pipelane_1.default({}, 'js'), {
        additionalInputs: {
            js: "${task.taskTypeName}"
        },
        last: []
    });
}
// test()
