import { MultiDbORM } from 'multi-db-orm';
import PipeLane, { PipeTask, PipeTaskDescription } from 'pipelane';
import { LoopEvaluateJsTask } from '../pipelane-server/server/pipe-tasks/LoopEvaluateJsTask';
import { AndroidBot } from '../bot';
import { EvalJSUtils } from '../pipelane-server/server/pipe-tasks/EvaluateJsTask';
import moment from 'moment'


interface FetchSchedulesTaskInputs {
    last: { id: string, status: boolean }[]
    additionalInputs: {

    };
}

export class ExecuteBotActionTask extends LoopEvaluateJsTask {
    static TASK_VARIANT_NAME: string = 'bot-js';
    bot: AndroidBot
    constructor(bot: AndroidBot) {
        super(ExecuteBotActionTask.TASK_VARIANT_NAME);
        this.bot = bot
    }

    kill(): boolean {
        return true;
    }


    describe(): PipeTaskDescription | undefined {
        let desc = super.describe();
        desc.summary += ". Additionally, `bot` variable is also accesible"
        desc.inputs.additionalInputs.js = `
// available variables: js, pl, input, prev, axios, Utils, bot
async function run(){
console.log(pl.inputs);
//must return an array in output
return [{status:true, pl_inputs:pl.inputs}];
}
run();
`
        return desc
    }


    async evalInScope(
        js,
        pl,
        input,
        prev,
        axios,
        Utils = EvalJSUtils,
        bot = this.bot) {
        return await eval(js)
    }
}