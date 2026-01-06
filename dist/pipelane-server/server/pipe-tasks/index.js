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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariantConfig = void 0;
const ApiTask_1 = require("./ApiTask");
const ShellTask_1 = require("./ShellTask");
const DelayTask_1 = require("./DelayTask");
const EvaluateJsTask_1 = require("./EvaluateJsTask");
const LoopApiTask_1 = require("./LoopApiTask");
const LoopEvaluateJsTask_1 = require("./LoopEvaluateJsTask");
const WriteFileTask_1 = require("./WriteFileTask");
const PipeManagerTask_1 = require("./PipeManagerTask");
const LoopShellTask_1 = require("./LoopShellTask");
exports.VariantConfig = {
    [ApiTask_1.ApiTask.TASK_TYPE_NAME]: [new ApiTask_1.ApiTask(ApiTask_1.ApiTask.TASK_VARIANT_NAME), new LoopApiTask_1.LoopApiTask(LoopApiTask_1.LoopApiTask.TASK_VARIANT_NAME)],
    [ShellTask_1.ShellTask.TASK_TYPE_NAME]: [new ShellTask_1.ShellTask(ShellTask_1.ShellTask.TASK_VARIANT_NAME, ["*"]), new LoopShellTask_1.LoopShellTask(LoopShellTask_1.LoopShellTask.TASK_VARIANT_NAME, ["*"])],
    [DelayTask_1.DelayTask.TASK_TYPE_NAME]: [new DelayTask_1.DelayTask(DelayTask_1.DelayTask.TASK_VARIANT_NAME)],
    [EvaluateJsTask_1.EvaluateJsTask.TASK_TYPE_NAME]: [new EvaluateJsTask_1.EvaluateJsTask(EvaluateJsTask_1.EvaluateJsTask.TASK_VARIANT_NAME), new LoopEvaluateJsTask_1.LoopEvaluateJsTask(LoopEvaluateJsTask_1.LoopEvaluateJsTask.TASK_VARIANT_NAME)],
    [WriteFileTask_1.WriteCsvFileTask.TASK_TYPE_NAME]: [new WriteFileTask_1.WriteCsvFileTask(WriteFileTask_1.WriteCsvFileTask.TASK_VARIANT_NAME)],
    [PipeManagerTask_1.PipeManagerTask.TASK_TYPE_NAME]: [new PipeManagerTask_1.PipeManagerTask()]
};
__exportStar(require("./"), exports);
