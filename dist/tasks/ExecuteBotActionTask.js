"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteBotActionTask = void 0;
const LoopEvaluateJsTask_1 = require("../pipelane-server/server/pipe-tasks/LoopEvaluateJsTask");
class ExecuteBotActionTask extends LoopEvaluateJsTask_1.LoopEvaluateJsTask {
    static TASK_TYPE_NAME = 'bot-js';
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
        return desc;
    }
    async evalInScope(js, pl, input, prev, axios, 
    //@ts-ignore
    Utils = EvalJSUtils, bot = this.bot) {
        return await eval(js);
    }
}
exports.ExecuteBotActionTask = ExecuteBotActionTask;
