"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePipelaneResolvers = generatePipelaneResolvers;
const model_1 = require("../../gen/model");
const db_1 = require("../db");
const graphql_1 = require("graphql");
const utils_1 = require("./utils");
function generateString() {
    const hours = new Date().getHours().toString().padStart(2, '0');
    const minutes = new Date().getMinutes().toString().padStart(2, '0');
    const seconds = new Date().getSeconds().toString().padStart(2, '0');
    const milliseconds = new Date().getMilliseconds().toString();
    const generatedString = `${hours}${minutes}${seconds}${milliseconds}`;
    return generatedString;
}
function generatePipelaneResolvers(db, variantConfig, cronScheduler, defaultExecutionRetentionCountPerPipe = 5) {
    if (db == undefined) {
        throw new Error('db supplied to pipelane must not be null');
    }
    /**
     * Deprecated
     * @param pipeEx
     * @returns
     */
    async function trimExecutionOld(pipeEx) {
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
    let cleaner = undefined;
    async function trimExecution(pipeEx, pipe) {
        if (!cleaner)
            cleaner = new PipelaneExecCleaner(db, PipelaneResolvers);
        await cleaner.handleExecution(pipeEx, pipe);
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
                let cached = cronScheduler.executionsCache.find(ex => ex.instanceId === parent.id);
                if (cached) {
                    //@ts-ignore
                    let tasks = (0, utils_1.getTasksExecFromPipelane)(cached);
                    if (tasks && tasks.length > 0)
                        return tasks;
                }
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
                    existing.step = existing.step ?? existingTasks.length;
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
            /**
             * Called every time regardless via GraphQL (executePipelane) or Cron
             * @param parent
             * @param request
             * @returns
             */
            async createPipelaneExecution(parent, request) {
                let existing = request.data.id && await db.getOne(db_1.TableName.PS_PIPELANE_EXEC, {
                    id: request.data.id
                });
                let tx = request.data;
                if (tx.status != model_1.Status.InProgress) {
                    trimExecution(existing || tx, tx.definition);
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
                if (!existing) {
                    throw new graphql_1.GraphQLError(`${request.name} does not exist.`);
                }
                let execution = await cronScheduler.triggerPipelane(existing, JSON.stringify(Object.assign(JSON.parse(existing.input), JSON.parse(request.input || '{}'))));
                if (!execution) {
                    throw new graphql_1.GraphQLError("Error triggering pipelane, perhaps it is disabled?");
                }
                return execution;
            },
            async stopPipelane(parent, request) {
                let cached = cronScheduler.executionsCache.find(ex => ex.instanceId === request.id);
                if (cached) {
                    cached.stop();
                    let plx = await db.getOne(db_1.TableName.PS_PIPELANE_EXEC, { id: request.id });
                    cronScheduler.pipelineLocks.delete(plx.name);
                    plx.status = model_1.Status.Skipped;
                    await db.update(db_1.TableName.PS_PIPELANE_EXEC, { id: request.id }, plx);
                    return plx;
                }
                else {
                    throw new graphql_1.GraphQLError("Pipelane execution not found. Perhaps its already terminated.");
                }
            },
        }
    };
    return PipelaneResolvers;
}
class PipelaneExecCleaner {
    db;
    PipelaneResolvers;
    counters = new Map();
    defaultRetention = 100; // fallback retention
    defaultOverflow = 5; // allow this many extra before trimming
    minBatchDelete = 2; // don't delete if only 1 needs removal
    persistEvery = 50; // persist metadata after this many increments
    constructor(db, PipelaneResolvers) {
        this.db = db;
        this.PipelaneResolvers = PipelaneResolvers;
    }
    // Initialize or load counter from DB. Called lazily.
    async initCounterIfMissing(pipelaneName) {
        const pkey = `excount_${pipelaneName}`;
        if (this.counters.has(pipelaneName))
            return this.counters.get(pipelaneName);
        const existing = await this.db.getOne(db_1.TableName.PS_PIPELANE_META, { pkey });
        let base = 0;
        if (existing && typeof existing.pval === 'string') {
            const n = Number(existing.pval);
            base = Number.isFinite(n) ? n : 0;
        }
        else {
            // create meta record if missing so other processes can see it
            await this.db.insert(db_1.TableName.PS_PIPELANE_META, { pkey, pval: '0' });
            base = 0;
        }
        const counter = { count: base, dirtySincePersist: 0 };
        this.counters.set(pipelaneName, counter);
        return counter;
    }
    // main entry — call on each new execution
    async handleExecution(pipeEx, pipe) {
        try {
            pipe = pipe || (await this.PipelaneResolvers.Query.Pipelane(undefined, { name: pipeEx.name }));
            if (!pipe)
                return;
            const pipelaneName = pipe.name;
            const counter = await this.initCounterIfMissing(pipelaneName);
            // Determine retention and overflow
            const retention = (pipe.executionsRetentionCount == undefined)
                ? this.defaultRetention
                : Number(pipe.executionsRetentionCount);
            const overflow = this.defaultOverflow;
            // increment in-memory counter
            counter.count = (counter.count || 0) + 1;
            counter.dirtySincePersist++;
            // Persist meta occasionally to avoid losing the counter on restarts
            if (counter.dirtySincePersist >= this.persistEvery) {
                await this.persistMeta(pipelaneName, counter.count);
                counter.dirtySincePersist = 0;
            }
            // If retention == 0 -> unbounded (no deletes)
            if (retention === 0)
                return;
            // Only trigger trimming when we exceed retention + overflow
            if (counter.count <= retention + overflow) {
                return; // OK for now
            }
            // Acquire simple in-memory lock for this pipelane to avoid concurrent trimmers
            if (counter.lock)
                return; // another trimmer is already running
            counter.lock = true;
            try {
                // Re-check counter since another trimmer could have changed it
                if (counter.count <= retention + overflow)
                    return;
                // Desired remaining: max(retention, floor(count/2)) to "trim by half"
                const desiredRemaining = Math.max(retention, Math.floor(counter.count / 2));
                let toDelete = counter.count - desiredRemaining;
                // Don't perform DB deletion for just 1 entry — wait for more accumulation
                if (toDelete <= this.minBatchDelete) {
                    // leave it to accumulate further; optionally persist meta
                    if (counter.dirtySincePersist > 0) {
                        await this.persistMeta(pipelaneName, counter.count);
                        counter.dirtySincePersist = 0;
                    }
                    return;
                }
                // Fetch the oldest `toDelete` executions from DB (asc by startTime)
                // If your DB supports projection, only fetch `id` to reduce payload.
                const oldest = await this.db.get(db_1.TableName.PS_PIPELANE_EXEC, { name: pipelaneName }, {
                    sort: [{ field: 'startTime', order: 'asc' }],
                    limit: toDelete,
                    // fields: ['id'] // <-- uncomment if supported by your DB adapter
                });
                if (!oldest || oldest.length === 0) {
                    // weird case: db says none; resync counter from DB only once in a while if you must
                    // (left as-is to avoid an expensive full scan every trim)
                    await this.persistMeta(pipelaneName, counter.count);
                    return;
                }
                console.log(`[pipelane-server] Trimming ${pipelaneName}: deleting ${oldest.length} oldest executions.`);
                // Delete oldest and their task-execs, waiting for completion
                await Promise.all(oldest.map(async (e) => {
                    await this.db.delete(db_1.TableName.PS_PIPELANE_TASK_EXEC, { pipelaneExId: e.id });
                    await this.db.delete(db_1.TableName.PS_PIPELANE_EXEC, { id: e.id });
                }));
                // *** FAST PATH: avoid full table scan. ***
                // We know how many we just deleted, so adjust the in-memory counter directly.
                const deleted = oldest.length; // actual number deleted
                counter.count = Math.max(0, (counter.count || 0) - deleted);
                counter.dirtySincePersist = 0;
                // Persist the new count (single source of truth for other processes)
                await this.persistMeta(pipelaneName, counter.count);
                // Optional: if you need stronger accuracy across multi-process writers,
                // schedule a rare background reconciliation using COUNT(*) (not implemented here)
                // e.g., every N trims or via a cron/maintenance job.
            }
            finally {
                counter.lock = false;
            }
        }
        catch (err) {
            console.error('handleExecution error for', pipeEx?.name, err);
        }
    }
    async persistMeta(pipelaneName, count) {
        const pkey = `excount_${pipelaneName}`;
        await this.db.update(db_1.TableName.PS_PIPELANE_META, { pkey }, { pval: `${count}` });
    }
}
