"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAdapterMultiDbOrm = void 0;
const multi_db_orm_1 = require("multi-db-orm");
const _1 = require(".");
const db_1 = require("../db");
class FirebaseAdapterMultiDbOrm extends multi_db_orm_1.FireStoreDB {
    insert(modelname, object, id) {
        if (modelname == db_1.TableName.PS_PIPELANE_TASK && object.pipelaneName && object.name) {
            object.id = object.id || _1.PipelaneUtils.generatePipelaneTaskId(object.pipelaneName, object.name);
        }
        if (modelname == db_1.TableName.PS_PIPELANE && object.name && !object.pipelaneName) {
            object.id = object.id || _1.PipelaneUtils.generatePipelaneId(object.name);
        }
        return super.insert(modelname, object, id);
    }
    async update(modelname, filter, object, id) {
        if (modelname == db_1.TableName.PS_PIPELANE_TASK) {
            // special handling to generate id if pipelaneName is updated when renaming a pipe
            if (!object.name && object.pipelaneName) {
                const existingTasks = await this.get(modelname, filter);
                return Promise.all(existingTasks.map(async (et) => {
                    super.delete(modelname, { pipelaneName: et.pipelaneName, name: et.name });
                    et.pipelaneName = object.pipelaneName;
                    et.id = _1.PipelaneUtils.generatePipelaneTaskId(object.pipelaneName, et.name);
                    return super.insert(modelname, et);
                }));
            }
            else {
                object.id = object.id || _1.PipelaneUtils.generatePipelaneTaskId(object.pipelaneName, object.name);
            }
        }
        else if (modelname == db_1.TableName.PS_PIPELANE && object.name) {
            object.id = object.id || _1.PipelaneUtils.generatePipelaneId(object.name);
        }
        return super.update(modelname, filter, object, id);
    }
}
exports.FirebaseAdapterMultiDbOrm = FirebaseAdapterMultiDbOrm;
