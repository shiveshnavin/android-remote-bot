"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pipelane_server_1 = require("./pipelane-server");
const multi_db_orm_1 = require("multi-db-orm");
const fs_1 = __importDefault(require("fs"));
const pipe_tasks_1 = require("./pipelane-server/server/pipe-tasks");
const app = (0, express_1.default)();
const firebaseCreds = fs_1.default.readFileSync('firebase-creds.json').toString();
const dbCreds = JSON.parse(firebaseCreds);
const db = new multi_db_orm_1.FireStoreDB(dbCreds);
const PORT = 8080;
app.use('/bot', (req, res) => {
    res.send({
        status: 'Bot up'
    });
});
(0, pipelane_server_1.creatPipelaneServer)(pipe_tasks_1.VariantConfig, db).then(pipelaneApp => {
    app.use('/pipelane', pipelaneApp);
    app.listen(PORT, () => {
        console.log('Android bot server started. Listening on port', PORT);
    });
});
