"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTask = void 0;
const axios_1 = __importDefault(require("axios"));
//@ts-ignore
const pipelane_1 = require("pipelane");
class ApiTask extends pipelane_1.PipeTask {
    static TASK_VARIANT_NAME = "api";
    static TASK_TYPE_NAME = "api";
    constructor(variantName) {
        super(ApiTask.TASK_TYPE_NAME, variantName || ApiTask.TASK_VARIANT_NAME);
    }
    kill() {
        return true;
    }
    async execute(pipeWorksInstance, input) {
        input = input.additionalInputs;
        if (!input.url) {
            return [{
                    status: false,
                    message: 'invalid input'
                }];
        }
        let options = input;
        try {
            let response = await (0, axios_1.default)(options);
            if (response) {
                return [{
                        status: response.status < 300,
                        statusCode: response.status,
                        headers: response.headers,
                        data: response?.data
                    }];
            }
        }
        catch (e) {
            pipeWorksInstance.onLog(e.message);
            return [{
                    status: false,
                    message: e.message,
                    statusCode: e.response?.status,
                    headers: e?.response.headers,
                    data: e.response?.data
                }];
        }
    }
}
exports.ApiTask = ApiTask;
