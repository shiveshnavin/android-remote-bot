"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTaskTypeResolvers = generateTaskTypeResolvers;
exports.getTasksExecFromPipelane = getTasksExecFromPipelane;
exports.mapStatus = mapStatus;
const model_1 = require("../../gen/model");
function generateTaskTypeResolvers(variantConfig) {
    return {
        TaskType: {
            description: (parent) => {
                let types = variantConfig[parent.type] || [];
                let anyType = types[0];
                return anyType.describe();
            },
            variants: (parent) => {
                if (parent.variants)
                    return parent.variants;
                let types = variantConfig[parent.type] || [];
                return types.map(pt => pt.getTaskVariantName());
            }
        },
        Query: {
            TaskType: async (parent, arg) => {
                let types = variantConfig[arg.type] || [];
                return {
                    type: arg.type,
                    variants: types.map(pt => pt.getTaskVariantName())
                };
            },
            taskTypes: () => {
                return Object.keys(variantConfig).map(vt => {
                    return {
                        type: vt
                    };
                });
            }
        }
    };
}
function getTasksExecFromPipelane(cached) {
    let executedTasks = cached.executedTasks;
    let executed = executedTasks.map(p => {
        let pltExec = {};
        pltExec.name = p.uniqueStepName || p.taskVariantName || p.taskTypeName;
        pltExec.pipelaneExId = cached.instanceId;
        pltExec.pipelaneName = cached.name;
        pltExec.status = p.statusMessage;
        if (pltExec.status != model_1.Status.Skipped) {
            pltExec.status = mapStatus('TASK_FINISHED', p.outputs);
        }
        pltExec.startTime = `${p.startTime}`;
        pltExec.endTime = `${p.endTime}`;
        let taskId = `${cached.instanceId}::${p.taskVariantName}::${pltExec.name}`;
        pltExec.id = taskId;
        pltExec.output = JSON.stringify(p.outputs || []);
        return pltExec;
    });
    let executing = [];
    //@ts-ignore
    let plExecutions = cached.currentExecutionTasks;
    if (plExecutions) {
        executing = plExecutions
            .filter(ex => {
            return !executedTasks.find(p => p.uniqueStepName === ex.task.uniqueStepName);
        })
            .map(ex => {
            let p = ex.task;
            let pltExec = {};
            pltExec.name = p.uniqueStepName || p.taskVariantName || p.taskTypeName;
            pltExec.pipelaneExId = cached.instanceId;
            pltExec.pipelaneName = cached.name;
            pltExec.status = model_1.Status.InProgress;
            pltExec.startTime = `${p.startTime}`;
            pltExec.endTime = undefined;
            pltExec.id = `${cached.instanceId}::${p.uniqueStepName}`;
            return pltExec;
        });
    }
    return [
        ...executed.sort((a, b) => {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }),
        ...executing.sort((a, b) => {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        })
    ];
}
function mapStatus(event, output) {
    if (event == 'SKIPPED')
        return model_1.Status.Skipped;
    let isAtleaseOneFail = (output || []).find(o => !o.status);
    let isAtleaseOneSuccess = (output || []).find(o => o.status);
    let status = model_1.Status.Success;
    if (isAtleaseOneFail) {
        status = model_1.Status.PartialSuccess;
    }
    if (!isAtleaseOneSuccess) {
        status = model_1.Status.Failed;
    }
    return status;
}
