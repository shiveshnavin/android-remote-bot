"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfilePage;
const react_1 = __importDefault(require("react"));
const react_2 = require("react");
const react_native_boxes_1 = require("react-native-boxes");
function ProfilePage() {
    const theme = (0, react_2.useContext)(react_native_boxes_1.ThemeContext);
    return (react_1.default.createElement(react_native_boxes_1.VPage, null,
        react_1.default.createElement(react_native_boxes_1.DemoScreen, null)));
}
