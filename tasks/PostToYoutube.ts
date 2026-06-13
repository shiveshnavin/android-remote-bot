import { PipeTaskDescription } from 'pipelane';
import { AndroidBot } from '../bot';
import { igEnterCaptionAndPost, igGoNextShare, switchProfile } from '../post-instagram';
import { PostToInstagram, ScheduleModel } from './PostToInstagram';
import { switchYtProfile, ytEnterCaptionAndPost, ytGoNextShare } from '../post-youtube';

export class PostToYoutube extends PostToInstagram {
    static TASK_VARIANT_NAME: string = 'youtube-bot';

    constructor(bot?: AndroidBot) {
        super(bot, PostToYoutube.TASK_VARIANT_NAME);
        this.bot = bot || new AndroidBot()
    }

    kill(): boolean {
        return true;
    }

    describe(): PipeTaskDescription | undefined {
        let desc = super.describe()
        desc.summary = 'Automatically posts to youtube.'
        return desc
    }

    async post(model, targetFile, outputPostItem) {
        let bot = this.bot
        if (model.tenant) {
            await bot.startApp("com.google.android.youtube")
            await bot.sleep(5000)
            this.onLog("Switching profile to ", model.tenant)
            await switchYtProfile(model.tenant)
        }
        await bot.shareVideoByFile(targetFile, undefined, "com.google.android.youtube")
        await bot.sleep(2000)
        // we click on center of vide tp pause it as animating fails the xml dump based element finding
        await bot.clickAtCenter()
        await bot.sleep(1000)

        await ytGoNextShare() // next 1
        await bot.sleep(1000)

        try {
            await ytGoNextShare().catch(async (e) => {
                let uploadBtn = await bot.findElementByAttribute("text", "Upload")
                console.log("2nd Next button not found", !!uploadBtn ? 'but upload button is there, so continuing (probably not a short)' : '')
                if (!uploadBtn) {
                    throw e
                }
                else {
                    throw new Error('Not a short')
                }
            }) // next 2
        } catch (e: any) {
            if (e?.message?.includes('Not a short')) {
                console.log('We onyl support shorts, Skipping video that is probably not a short but marking it as completed so as to not block the other schedules! Check the generation!')
                bot.killApp('com.google.android.youtube')
                return
            } else {
                throw e
            }

        }


        await bot.sleep(2000)
        await ytEnterCaptionAndPost(outputPostItem.text_small || 'Check this out !')
    }
}