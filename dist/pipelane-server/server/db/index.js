"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableName = void 0;
exports.initialzeDb = initialzeDb;
const multi_db_orm_1 = require("multi-db-orm");
const model_1 = require("../../gen/model");
exports.TableName = {
    PS_PIPELANE: "ps_pipelane",
    PS_PIPELANE_TASK: "ps_pipelane_task",
    PS_PIPELANE_EXEC: "ps_pipelane_exec",
    PS_PIPELANE_TASK_EXEC: "ps_pipelane_task_exec",
    PS_PIPELANE_META: "ps_pipelane_meta",
};
/**
 * Provide either db or MySQL Config
 * @param db
 * @param mysqlConfig
 */
function initialzeDb(db, mysqlConfig) {
    db = db || new multi_db_orm_1.MySQLDB({
        ...mysqlConfig,
        database: 'pipelane',
        connectTimeout: 30000,
        acquireTimeout: 30000,
        timeout: 30000,
        connectionLimit: 30,
    });
    let pl = {
        active: true,
        input: 'stringlarge',
        name: 'smallstring',
        schedule: 'smallstring',
        retryCount: 0,
        executionsRetentionCount: 5,
        updatedTimestamp: 'smallstring'
    };
    let plt = {
        name: 'smallstring',
        pipelaneName: 'smallstring',
        isParallel: true,
        step: 1,
        active: true,
        input: 'stringlarge',
        taskVariantName: 'smallstring',
        taskTypeName: 'smallstring'
    };
    let plx = {
        name: 'smallstring',
        id: 'smallstring',
        endTime: 'smallstring',
        output: 'stringlarge',
        status: model_1.Status.Success,
        startTime: 'smallstring',
    };
    let pltx = {
        pipelaneExId: 'smallstring',
        pipelaneName: 'smallstring',
        name: 'smallstring',
        id: 'smallstring',
        endTime: 'smallstring',
        output: 'stringlarge',
        status: model_1.Status.Success,
        startTime: 'smallstring',
    };
    let plm = {
        pkey: 'smallstring',
        pval: 'smallstring'
    };
    let tablePromises = [
        db.create(exports.TableName.PS_PIPELANE, pl),
        db.create(exports.TableName.PS_PIPELANE_TASK, plt),
        db.create(exports.TableName.PS_PIPELANE_EXEC, plx),
        db.create(exports.TableName.PS_PIPELANE_TASK_EXEC, pltx),
        db.create(exports.TableName.PS_PIPELANE_META, plm),
    ];
    Promise.all(tablePromises).then(() => console.log('pipelane:DB Initialized: ', tablePromises.length, 'tables'));
    function clean() {
        db.delete(exports.TableName.PS_PIPELANE_EXEC, {});
        db.delete(exports.TableName.PS_PIPELANE_TASK_EXEC, {});
    }
    return db;
    // clean()
}
