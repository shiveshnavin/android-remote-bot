import { AndroidBot } from "./bot";

const bot = new AndroidBot()


async function start() {
    await bot.wakeup()
}



start()