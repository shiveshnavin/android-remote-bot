"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./bot");
const bot = new bot_1.AndroidBot();
async function start() {
    await bot.wakeup();
}
start();
