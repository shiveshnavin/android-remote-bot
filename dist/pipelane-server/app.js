"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multi_db_orm_1 = require("multi-db-orm");
const server_1 = require("./server");
const pipe_tasks_1 = require("./server/pipe-tasks");
const express_1 = __importDefault(require("express"));
const mcp_1 = require("./server/mcp");
const app = (0, express_1.default)();
const port = process.env.PORT || 4001;
const db = new multi_db_orm_1.SQLiteDB('database.sqlite');
app.use((0, mcp_1.createMcpServer)(pipe_tasks_1.VariantConfig, db));
(0, server_1.creatPipelaneServer)(pipe_tasks_1.VariantConfig, db, 2).then(pipelane => {
    app.use('/pipelane', pipelane);
    app.use('/', (req, res) => res.redirect('/pipelane'));
    app.listen(port, () => {
        console.log(`Running a GraphQL API server at http://localhost:${port}/graph. Current time: ${new Date().toLocaleString()}`);
    });
});
