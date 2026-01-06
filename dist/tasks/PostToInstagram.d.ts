import PipeLane, { PipeTask, PipeTaskDescription } from 'pipelane';
import { ErrorOutput } from '../pipelane-server/server/pipe-tasks';
import { AndroidBot } from '../bot';
export type ScheduleModelPayload = {
    generated_cover_file_url: string;
    generated_file_url: string;
    outpotPostItem: string | {
        text: string;
        text_small?: string;
    };
};
export type ScheduleModel = {
    id: string;
    nextTimeStamp: number;
    extra: string;
    status: boolean;
    subType: string;
    tenant: string;
    type: string;
    payload: ScheduleModelPayload;
} & ErrorOutput;
interface PostToInstagramInputs {
    last: ScheduleModel[];
    additionalInputs: ScheduleModelPayload & {
        cleanup?: boolean;
    };
}
export declare class PostToInstagram extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string;
    static TASK_TYPE_NAME: string;
    bot: AndroidBot;
    constructor(bot?: AndroidBot, variantName?: string);
    kill(): boolean;
    describe(): PipeTaskDescription | undefined;
    post(model?: ScheduleModel, targetFile?: string, outpotPostItem?: {
        text: string;
        text_small?: string;
    }): Promise<void>;
    posted: any[];
    execute(pipeWorksInstance: PipeLane, input: PostToInstagramInputs): Promise<any[]>;
    wakeDevice(): Promise<void>;
}
export {};
