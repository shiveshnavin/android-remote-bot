import PipeLane, { PipeTask, PipeTaskDescription } from 'pipelane';
import { ErrorOutput } from '../pipelane-server/server/pipe-tasks';
import { AndroidBot } from '../bot';
import { igEnterCaptionAndPost, igGoNextShare, shareFile, switchProfile } from '..';
export type ScheduleModelPayload = {
    generated_cover_file_url: string;
    generated_file_url: string;
    outpotPostItem: string | { text: string };
}
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
    last: ScheduleModel[]
    additionalInputs: ScheduleModelPayload;
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
                        generated_cover_file_url: 'string, url of the file',
                        generated_file_url: 'string, optional, url of the cover file',
                        outpotPostItem: {
                            text: 'string, caption text for the post'
                        },
                    }
                }],
                additionalInputs: {
                    generated_cover_file_url: 'string, url of the file',
                    generated_file_url: 'string, optional, url of the cover file',
                    outpotPostItem: {
                        text: 'string, caption text for the post'
                    },
                },
            },
        };
    }

    posted = []
    async execute(
        pipeWorksInstance: PipeLane,
        input: PostToInstagramInputs
    ): Promise<any[]> {
        let bot = this.bot

        let last = input.last
        if (!last || last.length == 0) {
            last = [{
                payload: input.additionalInputs as any
            } as any]
        }
        for (let model of last) {
            try {

                let isDeviceOn = await bot.isScreenOn()
                this.onLog("Is device on =", isDeviceOn)
                if (!isDeviceOn) {
                    await bot.turnOnScreen()
                    this.onLog("Woke up device")
                }
                let payload: ScheduleModelPayload = model.payload
                if (typeof payload == 'string') {
                    payload = JSON.parse(payload)
                }

                let outpotPostItem: any = payload.outpotPostItem
                if (typeof outpotPostItem == 'string') {
                    outpotPostItem = JSON.parse(outpotPostItem)
                }


                let caption = outpotPostItem.text
                let url = payload.generated_file_url
                if (this.posted.includes(url)) {
                    model.status = true
                    model.message = `Posted successfully!`
                    continue
                }
                this.posted.push(url)
                let fileName = getFilenameFromUrl(url)
                let downloadDir = '/sdcard/Download'
                let targetFile = downloadDir + "/" + fileName
                let downloadCmd = `wget -q -O ${targetFile} ${url}  > /dev/null 2>&1`

                this.onLog(fileName, 'downloading to', targetFile)
                this.onLog('Posting start: ', caption)
                await (bot.executeCommand(downloadCmd).catch(e => { }))
                await bot.setVolumeToZero()
                await bot.pressBackKey(5)
                if (model.tenant) {
                    await bot.openActivity("com.instagram.android/com.instagram.android.activity.MainTabActivity")
                    await bot.sleep(5000)
                    await switchProfile(model.tenant)
                }
                await shareFile(targetFile, "com.instagram.android/com.instagram.share.handleractivity.ShareHandlerActivity")
                await bot.sleep(5000)
                await igGoNextShare()
                await bot.sleep(2000)
                await igEnterCaptionAndPost(caption)
                model.status = true
                model.message = `Posted successfully!`
            } catch (error) {
                await bot.pressBackKey(5)
                this.onLog(`Error processing schedule: ${error.message}`);
                model.status = false
                model.message = `Error processing schedule: ${error.message}`
            } finally {
                await bot.setVolumeToMax()
            }
        }
        // await bot.turnOffScreen()

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
