"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluateJsTask = exports.EvalJSUtils = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const pipelane_1 = __importStar(require("pipelane"));
exports.EvalJSUtils = {
    mkdir(path) {
        if (!fs_1.default.existsSync(path)) {
            fs_1.default.mkdirSync(path);
        }
    },
    escapeJSONString(str) {
        return str
            .replace(/"/g, '\\"');
    }
};
/**
 * Deprecated. Use LoopEvaluateJsTask instead
 */
class EvaluateJsTask extends pipelane_1.PipeTask {
    static TASK_VARIANT_NAME = "eval-js";
    static TASK_TYPE_NAME = "eval-js";
    timeoutId;
    constructor(variantName) {
        super(EvaluateJsTask.TASK_TYPE_NAME, variantName || EvaluateJsTask.TASK_VARIANT_NAME);
    }
    kill() {
        return true;
    }
    async evalInScope(js, pl, input, prev, axios, Utils = exports.EvalJSUtils) {
        return await eval(js);
    }
    /**
     *
     * @param pipeWorksInstance
     * @param input { additionalInputs: {js} }, No need to enclose js in this input with ${} as it is           understood that the value of field js is a javascript string
     * @returns
     */
    async execute(pipeWorksInstance, input) {
        if (!input.additionalInputs.js) {
            return [{
                    status: false,
                    message: 'invalid input. required field `js` in additionalInputs  missing'
                }];
        }
        let js = input.additionalInputs.js;
        let prev = input.last;
        try {
            let output = await this.evalInScope(js, pipeWorksInstance, input, prev, axios_1.default, exports.EvalJSUtils);
            return [{
                    status: true,
                    output: output
                }];
        }
        catch (e) {
            return [{
                    status: false,
                    error: e.message
                }];
        }
    }
    async evaluatePlaceholdersInString(pl, input, jsInputString) {
        const placeholderRegex = /\${([^}]+)}/g;
        let prev = input.last;
        //@ts-ignore
        let replacedString = jsInputString;
        const matches = jsInputString.matchAll(placeholderRegex);
        for (const match of matches) {
            const [fullMatch, placeholder] = match;
            const result = await this.evalInScope(placeholder.trim(), pl, input, prev, axios_1.default, exports.EvalJSUtils);
            replacedString = replacedString.replace(fullMatch, result?.toString());
        }
        return replacedString;
    }
}
exports.EvaluateJsTask = EvaluateJsTask;
const cut = new EvaluateJsTask();
function test() {
    cut.execute(new pipelane_1.default({}, 'js'), {
        additionalInputs: {
            js: "${task.taskTypeName}"
        },
        last: []
    });
}
// test()
