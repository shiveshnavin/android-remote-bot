import express from 'express'
import { creatPipelaneServer } from './pipelane-server'
import { FireStoreDB } from 'multi-db-orm'
import fs from 'fs'
import { VariantConfig } from './pipelane-server/server/pipe-tasks'
const app = express()
const firebaseCreds = fs.readFileSync('firebase-creds.json').toString()
const dbCreds = JSON.parse(firebaseCreds)
const db = new FireStoreDB(dbCreds)
const PORT = 8080




app.use('/bot', (req, res) => {
    res.send({
        status: 'Bot up'
    })
})

creatPipelaneServer(VariantConfig, db).then(pipelaneApp => {
    app.use('/pipelane', pipelaneApp)
    app.get('/**', (req, res, next) => {
        if (req.originalUrl.startsWith('/pipeline')) {
            return next();
        } else {
            const newUrl = '/pipelane' + req.originalUrl;
            console.log(`Redirecting from '${req.originalUrl}' to '${newUrl}'`);
            return res.redirect(newUrl);
        }
    });

    app.listen(PORT, () => {
        console.log('Android bot server started. Listening on port', PORT)
    })
})

