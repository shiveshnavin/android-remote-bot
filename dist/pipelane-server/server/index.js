"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatPipelaneServer = creatPipelaneServer;
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const resolvers_1 = require("./graphql/resolvers");
const db_1 = require("./db");
const cron_1 = require("./cron");
const pipelane_1 = require("./graphql/pipelane");
const app = (0, express_1.default)();
//see https://docs.expo.dev/more/expo-cli/#hosting-with-sub-paths
//cd client && npx expo export
const ui = express_1.default.Router();
ui.all('*', express_1.default.static(path_1.default.join(__dirname, '../client/dist')), (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../client/dist/index.html'));
});
async function creatPipelaneServer(variantConfig, persistance, pipelaneLogLevel = 2) {
    let db;
    //@ts-ignore
    if (persistance.getOne != undefined) {
        //@ts-ignore
        db = (0, db_1.initialzeDb)(persistance);
        //@ts-ignore
    }
    else if (persistance.host != undefined) {
        //@ts-ignore
        db = (0, db_1.initialzeDb)(undefined, persistance);
    }
    else {
        throw new Error('Unable to intialize pipelane server. persistance must be either and instance of MultiDbORM or MySQLDBConfig');
    }
    const cronScheduler = new cron_1.CronScheduler(variantConfig, pipelaneLogLevel);
    const resolvers = (0, resolvers_1.generateResolvers)(db, variantConfig, cronScheduler);
    const pipelaneResolver = (0, pipelane_1.generatePipelaneResolvers)(db, variantConfig);
    pipelaneResolver.Query.pipelanes().then(pls => {
        cronScheduler.init(pls, pipelaneResolver);
        cronScheduler.startAll();
        console.log('pipelane:Scheduled', pls.length, 'pipes');
    }).catch(err => {
        console.error('pipelane:Error initializing pipelanes. ', err.message);
    });
    const typeDefs = fs_1.default.readFileSync(path_1.default.join(__dirname, '../', 'model.graphql')).toString();
    const appoloServer = new server_1.ApolloServer({
        typeDefs,
        resolvers,
    });
    await appoloServer.start();
    app.use('/graph', express_1.default.json(), (0, express4_1.expressMiddleware)(appoloServer));
    app.use(ui);
    let services = {
        db: db,
        cron: cronScheduler,
        //@ts-ignore
        resolvers: resolvers
    };
    app.set('services', services);
    return app;
}
//@ts-ignore
let dummyResolver = (0, pipelane_1.generatePipelaneResolvers)({}, {});
