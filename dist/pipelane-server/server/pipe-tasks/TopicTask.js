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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicTask = void 0;
const multi_db_orm_1 = require("multi-db-orm");
const pipelane_1 = __importStar(require("pipelane"));
class TopicTask extends pipelane_1.PipeTask {
    kill() {
        return false;
    }
    static TASK_TYPE_NAME = "topic";
    static VARIANT_READ = "read";
    static VARIANT_WRITE = "write";
    tableName;
    db = undefined;
    initialized = false;
    constructor(variantName, db, tableName = 'ps_pipelane_topics') {
        super(TopicTask.TASK_TYPE_NAME, variantName);
        this.tableName = tableName;
        if (!db) {
            try {
                db = new multi_db_orm_1.SQLiteDB('pipelane.sqlite');
            }
            catch (e) {
                throw new Error('Must provide `db` or install `sqlite3` package to use TopicTask');
            }
        }
        this.db = db;
        this.initDb();
    }
    async initDb() {
        if (this.initialized)
            return;
        await this.db.create(this.tableName, {
            id: 'stringsmall',
            priority: 111,
            state: 'stringsmall',
            updatedTimestamp: 111,
            createdTimestamp: 111,
            queue: 'stringsmall',
            payload: 'stringlarge'
        }).catch(e => {
            this.onLog('Error initializing db for TopicTask. ' + e.message);
        }).finally(() => {
            this.initialized = true;
        });
    }
    describe() {
        return {
            summary: 'Handles reading and writing topics to the DB.',
            inputs: {
                last: [{ status: true }],
                additionalInputs: {
                    limit: 'number of topics to load (read), defaults to 1. If 1, read topic from pl.inputs.topic else from pl.inputs.topics',
                    queue: 'queue name, defaults to pipelane name (read, write)',
                    id: 'topic id (read), optional',
                    state: 'topic state  (read)(write)',
                    order: 'asc (default)(read), desc, ordered by createdTimestamp',
                    notifyOnExhausted: '(read) comma separated list of users to notify when queue is exhausted',
                }
            }
        };
    }
    async notifyUser(queue, user, message, task = this, pl = this.pipeWorkInstance) {
        this.onLog(`Notifying user ${user}: ${message}`);
    }
    async execute(pipeWorksInstance, input) {
        if (!this.initialized)
            await this.initDb();
        const variant = this.getTaskVariantName();
        let queue = input.additionalInputs?.queue || pipeWorksInstance.name;
        if (variant === TopicTask.VARIANT_READ) {
            let limit = input.additionalInputs?.limit || 1;
            let id = input.additionalInputs?.id;
            let topics = [];
            if (id) {
                const topic = await this.db.getOne(this.tableName, { id });
                if (topic)
                    topics = [topic];
            }
            else {
                let filter = {
                    queue
                };
                filter.state = input.additionalInputs?.state ?? 'scheduled';
                topics = await this.db.get(this.tableName, filter, {
                    limit, sort: [
                        {
                            field: 'priority',
                            order: 'asc'
                        },
                        {
                            field: 'createdTimestamp',
                            order: input.additionalInputs?.order ?? 'asc'
                        }
                    ]
                });
            }
            if (topics.length === 0 && input.additionalInputs?.notifyOnExhausted) {
                let users = [''];
                if (typeof input.additionalInputs.notifyOnExhausted === 'string')
                    users = input.additionalInputs.notifyOnExhausted.split(',').map(u => u.trim()).filter(u => u.length > 0);
                for (let user of users) {
                    await this.notifyUser(queue, user, `[${pipeWorksInstance.name}]\n\nQueue ${queue} is exhausted ⚠️.`, this, pipeWorksInstance);
                }
            }
            pipeWorksInstance.inputs.topic = topics[0];
            pipeWorksInstance.inputs.topics = topics;
            if (!input.last || input.last?.length <= 0) {
                return topics.map(t => ({ status: true, ...t }));
            }
        }
        if (variant === TopicTask.VARIANT_WRITE) {
            let now = Date.now();
            function normalizeTopic(t) {
                return {
                    ...t,
                    id: t.id || `${t.queue}-${now + Math.floor(Math.random() * 10000)}`,
                    priority: t.priority || input.additionalInputs?.priority || 100,
                    queue: t.queue || queue,
                    state: t.state || input.additionalInputs?.state || 'scheduled',
                    updatedTimestamp: now,
                    createdTimestamp: t.createdTimestamp || now,
                };
            }
            let topicsToWrite = [];
            if (pipeWorksInstance.inputs.topic) {
                topicsToWrite.push(normalizeTopic(pipeWorksInstance.inputs.topic));
            }
            else if (pipeWorksInstance.inputs.topics) {
                for (let t of pipeWorksInstance.inputs.topics) {
                    topicsToWrite.push(normalizeTopic(t));
                }
            }
            else if (input.additionalInputs
                && input.additionalInputs.state
                && input.additionalInputs.queue) {
                topicsToWrite.push(normalizeTopic(input.additionalInputs || {}));
            }
            let results = [];
            for (let t of topicsToWrite) {
                let dbFilter = { id: t.id };
                let existing = t.id ? (await this.db.getOne(this.tableName, dbFilter)) : undefined;
                t = Object.assign({
                    ...t,
                    ...input.additionalInputs
                });
                if (existing) {
                    await this.db.update(this.tableName, dbFilter, t);
                }
                else {
                    t.id = `${t.queue}-${Date.now()}`;
                    await this.db.insert(this.tableName, t);
                }
                results.push({ ...t });
            }
        }
        return input.last || [{ status: true }];
    }
}
exports.TopicTask = TopicTask;
// Example test function to demonstrate TopicTask usage
async function test() {
    // Setup a dummy PipeLane instance
    const pl = new pipelane_1.default({}, "newQueue");
    pl.inputs = {};
    // Write test
    const writeTask = new TopicTask(TopicTask.VARIANT_WRITE);
    const writeInput = {
        last: [{
                status: true,
                message: "This is a test"
            }],
        additionalInputs: {
            id: "topic1",
            priority: 1,
            state: "pending_approval",
            payload: { foo: "bar" },
            queue: "testQueue"
        }
    };
    const writeResult = await writeTask.execute(pl, writeInput);
    console.log("Write Result:", writeResult);
    // Read test (single)
    const readTask = new TopicTask(TopicTask.VARIANT_READ);
    const readInputSingle = {
        last: [{
                status: true,
                message: "This is a test"
            }],
        additionalInputs: {
            id: "topic1",
            queue: "testQueue",
            limit: 1
        }
    };
    const readResultSingle = await readTask.execute(pl, readInputSingle);
    console.log("Read Result (single):", readResultSingle);
    console.log("Read Result (pl.inputs):", pl.inputs.topic);
    const readResultSingleNoLast = await readTask.execute(pl, {
        additionalInputs: readInputSingle.additionalInputs
    });
    console.log("Read Result no last (single):", readResultSingleNoLast);
    console.log("Read Result no last (pl.inputs):", pl.inputs.topic);
    pl.inputs.topic.state = 'failed';
    // Write multiple topics
    pl.inputs.topics = [
        pl.inputs.topic,
        {
            id: "topic3",
            priority: 3,
            state: "completed",
            payload: { baz: "qux" },
            queue: "testQueue"
        }
    ];
    const writeMultiResult = await writeTask.execute(pl, { additionalInputs: {} });
    console.log("Write Multiple Result:", writeMultiResult);
    // Read test (multiple)
    const readInputMulti = {
        last: [{
                status: true,
                message: "This is a test"
            }],
        additionalInputs: {
            queue: "testQueue",
            limit: 5
        }
    };
    const readResultMulti = await readTask.execute(pl, readInputMulti);
    console.log("Read Result (multiple):", readResultMulti);
    console.log("Read Result (pl.inputs.topics):", pl.inputs.topics);
}
// Uncomment to run test
// test();
