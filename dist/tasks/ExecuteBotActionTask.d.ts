import { PipeTaskDescription } from 'pipelane';
import { LoopEvaluateJsTask } from '../pipelane-server/server/pipe-tasks/LoopEvaluateJsTask';
import { AndroidBot } from '../bot';
export declare class ExecuteBotActionTask extends LoopEvaluateJsTask {
    static TASK_TYPE_NAME: string;
    bot: AndroidBot;
    constructor(bot: AndroidBot);
    kill(): boolean;
    describe(): PipeTaskDescription | undefined;
    evalInScope(js: any, pl: any, input: any, prev: any, axios: any, Utils?: any, bot?: AndroidBot): Promise<any>;
}
