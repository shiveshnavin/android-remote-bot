import PipeLane, { PipeTask, PipeTaskDescription } from 'pipelane';
import { ErrorOutput } from '../pipelane-server/server/pipe-tasks';
import { AndroidBot } from '../bot';

export type ScheduleModel = {
    id: string;
    nextTimeStamp: number;
    extra: string;
    status: boolean;
    subType: string;
    tenant: string;
    type: string;
    payload: {
        generated_cover_file_url: string;
        generated_file_url: string;
        outpotPostItem: string;
    };
} & ErrorOutput;

interface PostToInstagramInputs {
    last: ScheduleModel[]
    additionalInputs: {

    };
}

export class PostToInstagram extends PipeTask<any, any> {
    static TASK_VARIANT_NAME: string = 'instagram-bot';
    static TASK_TYPE_NAME: string = 'android-bot';

    bot: AndroidBot
    constructor() {
        super(PostToInstagram.TASK_TYPE_NAME, PostToInstagram.TASK_VARIANT_NAME);
        this.bot = new AndroidBot()
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
                    tenant: 'Username',
                    subType: 'The subType of media to fetch.',
                    limit: 'The maximum number of videos to fetch.',
                },
            },
        };
    }

    async execute(
        pipeWorksInstance: PipeLane,
        input: PostToInstagramInputs
    ): Promise<any[]> {

        let last = input.last
        for (let model of last) {
            try {

                let bot = this.bot
                let isDeviceOn = await bot.isScreenOn()
                this.onLog("Is device on =", isDeviceOn)
                if (!isDeviceOn) {
                    await bot.turnOnScreen()
                    this.onLog("Woke up device")
                }

            } catch (error) {
                this.onLog(`Error processing schedule: ${error.message}`);
                model.status = false
                model.message = `Error processing schedule: ${error.message}`
            }
        }

        return last
    }

    async wakeDevice() {

    }
}

