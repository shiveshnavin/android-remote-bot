"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePipelaneResolvers = generatePipelaneResolvers;
const model_1 = require("../../gen/model");
const db_1 = require("../db");
const graphql_1 = require("graphql");
function generateString() {
    const hours = new Date().getHours().toString().padStart(2, '0');
    const minutes = new Date().getMinutes().toString().padStart(2, '0');
    const seconds = new Date().getSeconds().toString().padStart(2, '0');
    const milliseconds = new Date().getMilliseconds().toString();
    const generatedString = `${hours}${minutes}${seconds}${milliseconds}`;
    return generatedString;
}
function generatePipelaneResolvers(db, variantConfig, cronScheduler, defaultExecutionRetentionCountPerPipe = 5) {
    async function trimExecution(pipeEx) {
        let pipe = await PipelaneResolvers.Query.Pipelane(undefined, {
            name: pipeEx.name
        });
        if (!pipe)
            return;
        let pipelaneName = pipe.name;
        let pkey = `excount_${pipelaneName}`;
        let existingCounter = await db.getOne(db_1.TableName.PS_PIPELANE_META, {
            pkey: pkey
        });
        if (!existingCounter) {
            await db.insert(db_1.TableName.PS_PIPELANE_META, {
                pkey: pkey,
                pval: '0'
            });
        }
        else {
            if (pipe.executionsRetentionCount == undefined) {
                pipe.executionsRetentionCount = defaultExecutionRetentionCountPerPipe;
            }
            let count = parseInt(existingCounter.pval) + 1;
            if (pipe.executionsRetentionCount == 0 || count > (pipe.executionsRetentionCount)) {
                db.get(db_1.TableName.PS_PIPELANE_EXEC, {
                    name: pipe.name
                }, {
                    sort: [{
                            field: 'startTime',
                            order: 'asc'
                        }],
                    limit: Math.round(count / 2)
                }).then(async (executions) => {
                    if (executions && executions.length > 0) {
                        executions = executions.slice(0, Math.round(count / 2));
                        executions.forEach((e) => {
                            db.delete(db_1.TableName.PS_PIPELANE_EXEC, {
                                id: e.id
                            });
                            db.delete(db_1.TableName.PS_PIPELANE_TASK_EXEC, {
                                pipelaneExId: e.id
                            });
                        });
                        let newCount = Math.max(0, count - executions.length);
                        newCount = (await db.get(db_1.TableName.PS_PIPELANE_EXEC, {
                            name: pipelaneName
                        })).length;
                        db.update(db_1.TableName.PS_PIPELANE_META, {
                            pkey: pkey
                        }, {
                            pval: `${newCount}`
                        });
                    }
                });
            }
            else {
                await db.update(db_1.TableName.PS_PIPELANE_META, {
                    pkey: pkey
                }, {
                    pval: `${Math.max(0, count)}`
                });
            }
        }
    }
    const PipelaneResolvers = {
        PipelaneExecution: {
            definition: (parent) => {
                return PipelaneResolvers.Query.Pipetask({}, {
                    name: parent.name,
                    pipelaneName: parent.pipelaneName
                });
            },
            tasks: async (parent) => {
                if (parent.tasks)
                    return parent.tasks;
                let tasks = await db.get(db_1.TableName.PS_PIPELANE_TASK_EXEC, {
                    pipelaneExId: parent.id
                }, {
                    sort: [{
                            field: 'startTime',
                            order: 'asc'
                        }]
                });
                return tasks || [];
            }
        },
        Pipetask: {
            active: (parent) => {
                if (typeof parent.active === "boolean") {
                    return parent.active;
                }
                if (typeof parent.active === "string") {
                    return parent.active.toLowerCase() === "true";
                }
                if (typeof parent.active === "number") {
                    return parent.active === 1;
                }
                return Boolean(parent.active);
            },
            isParallel: (parent) => {
                if (typeof parent.isParallel === "boolean") {
                    return parent.isParallel;
                }
                if (typeof parent.isParallel === "string") {
                    return parent.isParallel.toLowerCase() === "true";
                }
                if (typeof parent.isParallel === "number") {
                    return parent.isParallel === 1;
                }
                return Boolean(parent.isParallel);
            }
        },
        Pipelane: {
            active: (parent) => {
                if (typeof parent.active === "boolean") {
                    return parent.active;
                }
                if (typeof parent.active === "string") {
                    return parent.active.toLowerCase() === "true";
                }
                if (typeof parent.active === "number") {
                    return parent.active === 1;
                }
                return Boolean(parent.active);
            },
            nextRun: (parent) => cronScheduler.getNextRun(parent.schedule).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata'
            }),
            tasks: async (parent) => {
                if (parent.tasks)
                    return parent.tasks;
                let tasks = await db.get(db_1.TableName.PS_PIPELANE_TASK, {
                    pipelaneName: parent.name
                }, {
                    sort: [{
                            field: 'step',
                            order: 'asc'
                        }]
                });
                return tasks || [];
            },
            async executions(parent) {
                let executions = await db.get(db_1.TableName.PS_PIPELANE_EXEC, { name: parent.name });
                return executions;
            },
        },
        Query: {
            Pipelane: async (parent, arg) => {
                let existing = await db.getOne(db_1.TableName.PS_PIPELANE, { name: arg.name });
                return existing;
            },
            Pipetask: async (parent, arg) => {
                let existing = await db.getOne(db_1.TableName.PS_PIPELANE_TASK, {
                    name: arg.name,
                    pipelaneName: arg.pipelaneName
                });
                return existing;
            },
            async PipelaneExecution(pr, arg) {
                let data = await db.getOne(db_1.TableName.PS_PIPELANE_EXEC, {
                    id: arg.id
                });
                return data;
            },
            pipelanes: async () => {
                let pls = await db.get(db_1.TableName.PS_PIPELANE, {}, {
                    sort: [
                        {
                            field: 'active',
                            order: 'desc'
                        },
                        {
                            field: 'updatedTimestamp',
                            order: 'desc'
                        }
                    ]
                });
                return pls;
            },
            pipelaneTasks: async (parent, arg) => {
                let pls = await db.get(db_1.TableName.PS_PIPELANE_TASK, { pipelaneName: arg.pipelaneName }, {
                    sort: [{
                            field: 'step',
                            order: 'asc'
                        }]
                });
                return pls;
            },
            async executions(parent, request) {
                let data = await db.get(db_1.TableName.PS_PIPELANE_EXEC, {}, {
                    limit: request.limit || 50,
                    sort: [{
                            field: 'startTime',
                            order: 'desc'
                        }]
                });
                return data?.filter(dt => dt.name && dt.id && dt.startTime);
            },
            pipelaneExecutions(pr, arg) {
                return db.get(db_1.TableName.PS_PIPELANE_EXEC, {
                    name: arg.pipelaneName
                }, {
                    limit: arg.limit || 50,
                    sort: [{
                            field: 'startTime',
                            order: 'desc'
                        }]
                });
            }
        },
        Mutation: {
            async createPipelaneTask(parent, request) {
                let input = request.data;
                let existing = await db.getOne(db_1.TableName.PS_PIPELANE_TASK, {
                    name: request.oldTaskName || input.name,
                    pipelaneName: input.pipelaneName
                });
                let isUpdate = existing != undefined;
                if (!isUpdate)
                    existing = {};
                Object.assign(existing, input);
                if (isUpdate)
                    await db.update(db_1.TableName.PS_PIPELANE_TASK, {
                        name: request.oldTaskName || input.name,
                        pipelaneName: input.pipelaneName
                    }, existing);
                else {
                    let existingTasks = await PipelaneResolvers.Pipelane.tasks({ name: input.pipelaneName }) || [];
                    existing.step = existingTasks.length;
                    await db.insert(db_1.TableName.PS_PIPELANE_TASK, existing);
                }
                return existing;
            },
            async clonePipelane(parent, request) {
                let existing = (await PipelaneResolvers.Query.Pipelane(undefined, request));
                if (!existing) {
                    throw new graphql_1.GraphQLError(`${request.name} does not exists`);
                }
                let tasks = await PipelaneResolvers.Pipelane.tasks(existing);
                let gens = generateString();
                existing.name = `${existing.name}-${gens}`;
                tasks.forEach(t => {
                    t.pipelaneName = existing.name;
                });
                existing.tasks = tasks;
                let newPl = await PipelaneResolvers.Mutation.createPipelane(undefined, {
                    data: existing
                });
                return newPl;
            },
            async createPipelane(parent, request) {
                let input = request.data;
                let tasks = request.data.tasks || [];
                let existing = await db.getOne(db_1.TableName.PS_PIPELANE, { name: request.oldPipeName || input.name });
                let isUpdate = existing != undefined;
                if (!isUpdate)
                    existing = {};
                let pl = Object.assign(existing, request.data);
                delete existing.tasks;
                existing.schedule = existing.schedule.trim();
                existing.retryCount = existing.retryCount || 0;
                existing.executionsRetentionCount = existing.executionsRetentionCount || defaultExecutionRetentionCountPerPipe;
                existing.updatedTimestamp = `${Date.now()}`;
                cronScheduler?.addToSchedule(existing);
                if (request.oldPipeName && request.oldPipeName != input.name) {
                    await db.update(db_1.TableName.PS_PIPELANE_TASK, {
                        pipelaneName: request.oldPipeName
                    }, {
                        pipelaneName: input.name
                    });
                }
                await Promise.all([
                    isUpdate ? db.update(db_1.TableName.PS_PIPELANE, {
                        name: request.oldPipeName || input.name
                    }, existing)
                        : db.insert(db_1.TableName.PS_PIPELANE, existing),
                    ,
                    ...tasks.map(async (tk) => {
                        tk.pipelaneName = input.name;
                        //@ts-ignore
                        PipelaneResolvers.Mutation.createPipelaneTask(tk, { data: tk });
                    })
                ]);
                return pl;
            },
            async deletePipelane(parent, request) {
                await db.delete(db_1.TableName.PS_PIPELANE, { name: request.name });
                await db.delete(db_1.TableName.PS_PIPELANE_TASK, { pipelaneName: request.name });
                await db.delete(db_1.TableName.PS_PIPELANE_EXEC, { name: request.name });
                cronScheduler.stopJob(request.name);
                return 'SUCCESS';
            },
            async deletePipelaneTask(parent, request) {
                await db.delete(db_1.TableName.PS_PIPELANE_TASK, {
                    name: request.name,
                    pipelaneName: request.pipelaneName
                });
                return 'SUCCESS';
            },
            async createPipelaneExecution(parent, request) {
                let existing = request.data.id && await db.getOne(db_1.TableName.PS_PIPELANE_EXEC, {
                    id: request.data.id
                });
                let tx = request.data;
                if (tx.status != model_1.Status.InProgress) {
                    trimExecution(existing || tx);
                }
                if (!existing) {
                    delete tx.definition;
                    delete tx.tasks;
                    request.data.id = request.data.id || `${tx.name}-${Date.now()}`;
                    await db.insert(db_1.TableName.PS_PIPELANE_EXEC, tx);
                    existing = tx;
                }
                else {
                    Object.assign(existing, tx);
                    delete existing.definition;
                    delete existing.tasks;
                    await db.update(db_1.TableName.PS_PIPELANE_EXEC, {
                        id: existing.id
                    }, existing);
                }
                return existing;
            },
            async createPipelaneTaskExecution(parent, request) {
                let existing = request.data.id && await db.getOne(db_1.TableName.PS_PIPELANE_TASK_EXEC, {
                    id: request.data.id
                });
                let tx = request.data;
                if (!existing) {
                    request.data.id = request.data.id || `${tx.pipelaneExId}::${tx.name}`;
                    await db.insert(db_1.TableName.PS_PIPELANE_TASK_EXEC, tx);
                }
                else {
                    Object.assign(existing, tx);
                    await db.update(db_1.TableName.PS_PIPELANE_TASK_EXEC, {
                        id: existing.id
                    }, existing);
                }
                return existing;
            },
            async executePipelane(parent, request) {
                let existing = await PipelaneResolvers.Query.Pipelane(parent, request);
                let execution = await cronScheduler.triggerPipelane(existing, request.input || existing.input);
                if (!execution) {
                    throw new graphql_1.GraphQLError("Error triggering pipelane, perhaps it is disabled?");
                }
                return execution;
            },
        }
    };
    return PipelaneResolvers;
}
