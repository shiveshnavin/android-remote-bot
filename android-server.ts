import express from 'express'
import { creatPipelaneServer } from './pipelane-server'
import { FireStoreDB } from 'multi-db-orm'
import fs from 'fs'
import { VariantConfig } from './pipelane-server/server/pipe-tasks'
import { FetchSchedulesTask } from './tasks/FetchSchedulesTask'
import { initRemoteCommand, RemoteCommandListerTask } from './remote-command'
import { PostToInstagram } from './tasks/PostToInstagram'
import { UpdateSchedulesTask } from './tasks/UpdateSchedulesTask'
import { createMcpServer } from './pipelane-server/server/mcp'
import { PipeTask } from 'pipelane'
import { ExecuteBotActionTask } from './tasks/ExecuteBotActionTask'
import { AndroidBot } from './bot'
import { EvaluateJsTask } from './pipelane-server/server/pipe-tasks/EvaluateJsTask'
import { LoopEvaluateJsTask } from './pipelane-server/server/pipe-tasks/LoopEvaluateJsTask'
const app = express()
const firebaseCreds = fs.readFileSync('firebase-creds.json').toString()
const dbCreds = JSON.parse(firebaseCreds)
const db = new FireStoreDB(dbCreds)

// must use FireStoreDB with this only
initRemoteCommand(db)

const PORT = process.env.PORT || 8080




app.use('/bot', (req, res) => {
    res.send({
        status: 'Bot up'
    })
})


const bot = new AndroidBot();
//@ts-ignore
VariantConfig[FetchSchedulesTask.TASK_TYPE_NAME] = [new FetchSchedulesTask(db)]
//@ts-ignore
VariantConfig[UpdateSchedulesTask.TASK_TYPE_NAME] = [new UpdateSchedulesTask(db)]
//@ts-ignore
VariantConfig[PostToInstagram.TASK_TYPE_NAME] = [new PostToInstagram(bot)]
VariantConfig[EvaluateJsTask.TASK_TYPE_NAME] = [
    new LoopEvaluateJsTask(),
    new ExecuteBotActionTask(bot)
]
//@ts-ignore
VariantConfig['restart-remote-command'] = [new RemoteCommandListerTask(db)]
const variantConfigs = VariantConfig;
// app.use(createMcpServer(VariantConfig, db))
creatPipelaneServer(variantConfigs, db).then(pipelaneApp => {
    app.use('/pipelane', pipelaneApp)
    app.get('/**', (req, res, next) => {
        if (req.originalUrl.startsWith('/pipeline')) {
            return next();
        } else {
            const newUrl = '/pipelane' + req.originalUrl;
            return res.redirect(newUrl);
        }
    });

    app.listen(PORT, () => {
        console.log('Android bot server started. Listening on port', PORT)
    })
})

