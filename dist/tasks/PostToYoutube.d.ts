import { PipeTaskDescription } from 'pipelane';
import { AndroidBot } from '../bot';
import { PostToInstagram } from './PostToInstagram';
export declare class PostToYoutube extends PostToInstagram {
    static TASK_VARIANT_NAME: string;
    constructor(bot?: AndroidBot);
    kill(): boolean;
    describe(): PipeTaskDescription | undefined;
    post(model: any, targetFile: any, outputPostItem: any): Promise<void>;
}
