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
const app = express()
const firebaseCreds = fs.readFileSync('firebase-creds.json').toString()
const dbCreds = JSON.parse(firebaseCreds)
const db = new FireStoreDB(dbCreds)

// must use FireStoreDB with this only
initRemoteCommand(db)

const PORT = 8080




app.use('/bot', (req, res) => {
    res.send({
        status: 'Bot up'
    })
})
VariantConfig[FetchSchedulesTask.TASK_TYPE_NAME] = [new FetchSchedulesTask(db)]
VariantConfig[UpdateSchedulesTask.TASK_TYPE_NAME] = [new UpdateSchedulesTask(db)]
VariantConfig[PostToInstagram.TASK_TYPE_NAME] = [new PostToInstagram()]
VariantConfig['restart-remote-command'] = [new RemoteCommandListerTask(db)]

app.use(createMcpServer(VariantConfig, db))
creatPipelaneServer(VariantConfig, db).then(pipelaneApp => {
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

