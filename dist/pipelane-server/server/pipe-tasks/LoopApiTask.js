"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopApiTask = void 0;
const axios_1 = __importDefault(require("axios"));
//@ts-ignore
const pipelane_1 = require("pipelane");
const limiter_1 = require("limiter");
class LoopApiTask extends pipelane_1.PipeTask {
    static TASK_VARIANT_NAME = "loop-api";
    static TASK_TYPE_NAME = "api";
    constructor(variantName) {
        super(LoopApiTask.TASK_TYPE_NAME, variantName || LoopApiTask.TASK_VARIANT_NAME);
    }
    kill() {
        return true;
    }
    describe() {
        return {
            summary: "Call APIs in parallel with rate limiting",
            inputs: {
                additionalInputs: {
                    sequential: "boolean, if true, other rate fields will be ignored",
                    rate: "Number, x requests / Y interval",
                    interval: "day | hour | min | sec"
                },
                last: [{
                        url: "axios request config",
                    }]
            }
        };
    }
    async execute(pipeWorksInstance, inputs) {
        const last = inputs.last;
        const outputs = [];
        const limiter = new limiter_1.RateLimiter({
            tokensPerInterval: inputs.additionalInputs?.rate || 10,
            interval: inputs.additionalInputs?.interval || 'second'
        });
        // Function to handle each request with rate limiting
        const handleRequest = async (options) => {
            if (!inputs.additionalInputs.sequential)
                await limiter.removeTokens(1);
            try {
                let response = await (0, axios_1.default)(options);
                return {
                    status: response.status < 300,
                    statusCode: response.status,
                    headers: response.headers,
                    data: response?.data
                };
            }
            catch (e) {
                pipeWorksInstance.onLog(e.message);
                return {
                    status: false,
                    message: e.message,
                    statusCode: e.response?.status,
                    headers: e?.response.headers,
                    data: e.response?.data
                };
            }
        };
        // Create a queue to manage parallel requests
        if (!inputs.additionalInputs.sequential) {
            const promises = last.map(options => handleRequest(options));
            const results = await Promise.all(promises);
            outputs.push(...results);
        }
        else {
            for (let options of last) {
                let response = await handleRequest(options).catch(e => ({
                    status: false,
                    message: `Request failed. ${e.message} ${e.response?.status} ${JSON.stringify(e.response?.data)}`
                }));
                outputs.push(response);
            }
        }
        return outputs;
    }
}
exports.LoopApiTask = LoopApiTask;
