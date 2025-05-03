"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = ErrorBoundary;
const react_1 = __importDefault(require("react"));
const react_native_boxes_1 = require("react-native-boxes");
function ErrorBoundary({ error, retry }) {
    return (react_1.default.createElement(react_native_boxes_1.Center, { style: { flex: 1, paddingTop: 20 } },
        react_1.default.createElement(react_native_boxes_1.TextView, null,
            "Error in rendering. ",
            error.message),
        react_1.default.createElement(react_native_boxes_1.TertiaryButtonView, { onPress: retry }, "Try Again?")));
}
