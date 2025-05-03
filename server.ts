import express from 'express'
import { creatPipelaneServer } from './pipelane-server'
import { FireStoreDB } from 'multi-db-orm'

const app = express()

const db = new FireStoreDB(JSON.parse(process.env.FIREBASE_SEVICE_ACCOUNT_JSON as string))
const PORT = 8080
creatPipelaneServer({}, db).then(pipelaneApp => {
    app.use(pipelaneApp)
    app.listen(PORT, () => {
        console.log('Android bot server started. Listening on port', PORT)
    })
})