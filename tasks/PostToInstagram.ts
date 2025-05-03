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
            summary: 'Automatically posts to instagram.',
            inputs: {
                last: [{
                    id: 'string',
                    nextTimeStamp: 'number',
                    extra: 'string',
                    status: 'boolean',
                    subType: 'string',
                    tenant: 'string',
                    type: 'string',
                    payload: {
                        generated_cover_file_url: 'string',
                        generated_file_url: 'string',
                        outpotPostItem: 'string',
                    }
                }],
                additionalInputs: {

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
                let payload = model.payload
                if (typeof payload == 'string') {
                    payload = JSON.parse(payload)
                }

                let outpotPostItem: any = payload.outpotPostItem
                if (typeof outpotPostItem == 'string') {
                    outpotPostItem = JSON.parse(outpotPostItem)
                }


                let caption = outpotPostItem.text
                let url = payload.generated_file_url

                let fileName = getFilenameFromUrl(url)
                let downloadDir = '/sdcard/Download'
                let targetFile = downloadDir + "/" + fileName
                let downloadCmd = `wget -P ${targetFile} ${url}`

                await bot.executeCommand(downloadCmd)
                this.onLog(fileName, 'downloaded to', targetFile)
                this.onLog('Posting start: ', caption)

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



const getFilenameFromUrl = (urlString) => {
    try {
        const url = new URL(urlString);
        // Get the pathname (e.g., '/path/to/file.txt')
        const pathname = url.pathname;
        // Find the last slash and take the substring after it
        const lastSlashIndex = pathname.lastIndexOf('/');
        const filename = pathname.substring(lastSlashIndex + 1);
        return filename;
    } catch (error) {
        // Handle invalid URLs
        console.error("Invalid URL:", urlString, error);
        return ""; // Return empty string for invalid URLs
    }
};
