"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteBotActionTask = void 0;
const LoopEvaluateJsTask_1 = require("../pipelane-server/server/pipe-tasks/LoopEvaluateJsTask");
const EvaluateJsTask_1 = require("../pipelane-server/server/pipe-tasks/EvaluateJsTask");
class ExecuteBotActionTask extends LoopEvaluateJsTask_1.LoopEvaluateJsTask {
    static TASK_VARIANT_NAME = 'bot-js';
    bot;
    constructor(bot) {
        super(ExecuteBotActionTask.TASK_VARIANT_NAME);
        this.bot = bot;
    }
    kill() {
        return true;
    }
    describe() {
        let desc = super.describe();
        desc.summary += ". Additionally, `bot` variable is also accesible";
        desc.inputs.additionalInputs.js = `
// available variables: js, pl, input, prev, axios, Utils, bot
async function run(){
console.log(pl.inputs);
//must return an array in output
return [{status:true, pl_inputs:pl.inputs}];
}
run();
`;
        return desc;
    }
    async evalInScope(js, pl, input, prev, axios, Utils = EvaluateJsTask_1.EvalJSUtils, bot = this.bot) {
        return await eval(js);
    }
}
exports.ExecuteBotActionTask = ExecuteBotActionTask;
