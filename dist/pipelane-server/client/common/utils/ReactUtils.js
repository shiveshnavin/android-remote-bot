"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = isObject;
exports.prettyJson = prettyJson;
exports.getNavParamsFromDeeplink = getNavParamsFromDeeplink;
const base64_js_1 = __importDefault(require("base64-js"));
function isObject(str) {
    if (!str) {
        return false;
    }
    try {
        JSON.parse(str);
        return true;
    }
    catch (e) {
        return false;
    }
}
function prettyJson(input) {
    if (input?.startsWith("base64")) {
        input = input.replace('base64;', '');
        input = new TextDecoder().decode(base64_js_1.default.toByteArray(input));
    }
    try {
        let output = '';
        let indentLevel = 0;
        let inString = false;
        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if (inString) {
                output += char;
                if (char === '"') {
                    if (input[i - 1] !== '\\') {
                        inString = false;
                    }
                }
                continue;
            }
            switch (char) {
                case '{':
                case '[':
                    output += char;
                    output += '\n';
                    indentLevel++;
                    output += ' '.repeat(indentLevel * 4);
                    break;
                case '}':
                case ']':
                    output += '\n';
                    indentLevel--;
                    output += ' '.repeat(indentLevel * 4);
                    output += char;
                    break;
                case ',':
                    output += char;
                    output += '\n';
                    output += ' '.repeat(indentLevel * 4);
                    break;
                case '"':
                    output += char;
                    inString = true;
                    break;
                default:
                    output += char;
            }
        }
        return output;
    }
    catch (e) {
        return input;
    }
}
function getNavParamsFromDeeplink(url) {
    let parts = url.split("/");
    let root, rootParams = {};
    root = parts[0];
    if (parts.length > 1) {
        let obj = {
            screen: '',
            params: {}
        };
        let lastCloneObj = undefined;
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            let cloneObj = Object.assign({}, obj);
            if (part?.indexOf("?") > -1) {
                cloneObj.screen = part.split("?")[0];
                const query = part.split("?")[1];
                const params = {};
                const queryParams = query.split("&");
                queryParams?.forEach((pk) => {
                    const [value, key] = pk.split("=");
                    params[key] = value;
                });
                cloneObj.params = params;
            }
            else {
                cloneObj.screen = part;
            }
            if (lastCloneObj == undefined) {
                lastCloneObj = cloneObj;
            }
            else {
                lastCloneObj.params = cloneObj;
            }
        }
        rootParams = lastCloneObj;
    }
    return [root, rootParams];
}
