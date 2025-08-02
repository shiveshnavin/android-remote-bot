"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteCommandListerTask = void 0;
exports.initRemoteCommand = initRemoteCommand;
const bot_1 = require("./bot");
const pipelane_1 = require("pipelane");
const bot = new bot_1.AndroidBot();
let listener = undefined;
function initRemoteCommand(db) {
    let collection = 'android_bot_remote_cmd';
    const deviceId = process.env.DEVICE_ID || 'default_device';
    const firestoreDb = db.db;
    if (listener) {
        try {
            listener.remove();
        }
        catch (e) { }
    }
    listener = firestoreDb.collection(collection)
        .where('deviceId', '==', deviceId)
        .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added' || change.type === 'modified') {
                const commandData = change.doc.data();
                const commandId = change.doc.id;
                if (commandData.status === 'SCHEDULED') {
                    console.log(`remote-cmd: Processing scheduled command: ${commandData.cmd}`);
                    firestoreDb.collection(collection).doc(commandId).update({
                        status: 'IN_PROGRESS',
                        startTime: new Date().toISOString()
                    }).then(() => {
                        bot.executeCommand(commandData.cmd).then(output => {
                            console.log(`remote-cmd: Command output: ${output}`);
                            firestoreDb.collection(collection).doc(commandId).update({
                                status: 'COMPLETED',
                                output: output,
                                endTime: new Date().toISOString()
                            });
                        }).catch(error => {
                            console.error(`remote-cmd: Command failed: ${error}`);
                            // Update status to FAILED and save error
                            firestoreDb.collection(collection).doc(commandId).update({
                                status: 'FAILED',
                                output: error.message || 'Unknown error',
                                endTime: new Date().toISOString()
                            });
                        });
                    }).catch(error => {
                        console.error(`remote-cmd: Failed to update status to IN_PROGRESS: ${error}`);
                    });
                }
            }
        });
    }, error => {
        console.error(`remote-cmd: Error listening to remote commands: ${error}`);
    });
    console.log(`remote-cmd: Listening for remote commands on collection: ${collection}`);
}
class RemoteCommandListerTask extends pipelane_1.PipeTask {
    db;
    constructor(db) {
        super('restart-remote-command', 'restart-remote-command');
        this.db = db;
    }
    kill() {
        return true;
    }
    async execute() {
        initRemoteCommand(this.db);
        return [{ status: true }];
    }
    describe() {
        return {
            summary: 'Restarts the remote task listener',
            inputs: {
                last: [],
                additionalInputs: {}
            }
        };
    }
}
exports.RemoteCommandListerTask = RemoteCommandListerTask;
