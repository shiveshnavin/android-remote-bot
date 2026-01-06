"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipeManagerTask = void 0;
const axios_1 = __importDefault(require("axios"));
//@ts-ignore
const pipelane_1 = require("pipelane");
class PipeManagerTask extends pipelane_1.PipeTask {
    static TASK_VARIANT_NAME = "manager";
    static TASK_TYPE_NAME = "pipe-manager";
    constructor(variantName) {
        super(PipeManagerTask.TASK_TYPE_NAME, variantName || PipeManagerTask.TASK_VARIANT_NAME);
    }
    kill() {
        return true;
    }
    getConfig(pipe) {
        let req = {
            method: 'post',
            url: pipe.endpoint,
            headers: {
                'Authorization': `Bearer ${pipe.access_token}`
            },
            data: {
                "operationName": "Mutation",
                "variables": {
                    "data": {
                        "active": pipe.action == 'enable',
                        "name": pipe.pipeName
                    }
                },
                "query": `mutation Mutation($data: CreatePipelanePayload!, $oldPipeName: ID) {\n  createPipelane(data: $data, oldPipeName: $oldPipeName) {\n    
                        name\n    
                        active\n    
                        schedule\n    
                        input\n    
                        nextRun\n    
                        retryCount\n    
                        executionsRetentionCount\n    
                        updatedTimestamp\n    
                        __typename\n  
                }\n
                }`
            }
        };
        if (pipe.action == 'delete') {
            req.data = {
                "operationName": "DeletePipelane",
                "variables": { "name": pipe.pipeName },
                "query": "mutation DeletePipelane($name: ID!) {\n  deletePipelane(name: $name)\n}"
            };
        }
        if (pipe.action == 'trigger') {
            req.data = {
                "operationName": "executePipelane",
                "variables": { "name": pipe.pipeName, "input": JSON.stringify(pipe.trigger_inputs || {}) }, "query": "mutation executePipelane($name: ID!, $input: String!) {\n  executePipelane(name: $name, input: $input) {\n    id\n    __typename\n  }\n}"
            };
        }
        return req;
    }
    async execute(pipeWorksInstance, input) {
        let pipeManagerInput = [];
        if (input.last && input.last.length > 0) {
            pipeManagerInput.push(...input.last);
        }
        if (input.additionalInputs?.pipeName) {
            pipeManagerInput.push(input.additionalInputs);
        }
        const promises = [];
        for (let pipe of pipeManagerInput) {
            if (pipe.pipeName) {
                if (!pipe.action) {
                    pipe.action = 'enable';
                }
                let request = this.getConfig(pipe);
                promises.push((0, axios_1.default)(request).then(res => {
                    res.data.status = true;
                    return res.data;
                }).catch(e => {
                    pipe.status = false;
                    pipe.message = e.message;
                    return pipe;
                }));
            }
        }
        return await Promise.all(promises);
    }
}
exports.PipeManagerTask = PipeManagerTask;
