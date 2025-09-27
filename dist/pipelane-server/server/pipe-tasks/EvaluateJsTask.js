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
const crypto_1 = require("crypto");
const moment_1 = __importDefault(require("moment"));
//@ts-ignore
const fast_xml_parser_1 = require("fast-xml-parser");
const parser = new fast_xml_parser_1.XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true
});
exports.EvalJSUtils = {
    fs: fs_1.default,
    getXmlParser() {
        return parser;
    },
    xml2json(xmlText) {
        return parser.parse(xmlText);
    },
    mkdir(path) {
        if (!fs_1.default.existsSync(path)) {
            fs_1.default.mkdirSync(path, { recursive: true });
        }
    },
    escapeJSONString(str) {
        return str
            .replace(/"/g, '\\"');
    },
    randomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },
    generateUID(input) {
        return (0, crypto_1.createHash)("sha256").update(input).digest("hex").substring(0, 10);
    },
    extractEnclosedObjString(inputString) {
        const regex = /\{[^\}]*\}/g;
        const results = inputString.match(regex);
        return results[0];
    },
    extractCodeFromMarkdown(markdown) {
        let codeBlocks = [];
        let regex = /```(.+?)\s*([\s\S]+?)```/gs;
        let match;
        while ((match = regex.exec(markdown))) {
            codeBlocks.push(match[2]);
        }
        return codeBlocks;
    },
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            // Generate a random index between 0 and i (inclusive)
            const j = Math.floor(Math.random() * (i + 1));
            // Swap elements at i and j
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    refineString(str, replacementChar = "_") {
        const regexPattern = new RegExp(`[^a-zA-Z0-9]`, "g");
        return str.replace(regexPattern, replacementChar);
    },
    generateRandomID(length = 10) {
        const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    },
    getFileNameFromURL(url) {
        const parsedURL = new URL(url);
        const pathname = parsedURL.pathname;
        const parts = pathname.split("/");
        const filename = parts[parts.length - 1];
        return filename;
    },
    decodeBase64(base64) {
        return Buffer.from(base64, "base64").toString("utf8");
    },
    getMoment() {
        return moment_1.default;
    },
    formatDate(date, format) {
        return (0, moment_1.default)(date).format(format);
    },
    encodeBase64(normalString) {
        return Buffer.from(normalString).toString("base64");
    },
    async sleep(ms) {
        return await new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
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
    describe() {
        return {
            summary: "Process JS. Must return in format [{status:true}]",
            inputs: {
                additionalInputs: {
                    js: "string, The js code, for example: console.log(pl.inputs);\n//the last line of the must be an array in output\n[{status:true, ...other data}]"
                },
                last: [{
                        status: true
                    }]
            }
        };
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
                    error: e.message,
                    stack: JSON.stringify(e.stack || '').substring(0, 100)
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
