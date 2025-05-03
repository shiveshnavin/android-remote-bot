"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppContext = exports.ContextData = void 0;
const react_1 = __importDefault(require("react"));
const react_native_boxes_1 = require("react-native-boxes");
class ContextData {
    appname = '';
    initialized = false;
    theme = new react_native_boxes_1.Theme();
    api;
    themeName = "dark";
    constructor(api) {
        this.api = api;
    }
}
exports.ContextData = ContextData;
exports.AppContext = react_1.default.createContext({
    context: new ContextData(undefined),
    setContext: (updatedCtx) => { }
});
