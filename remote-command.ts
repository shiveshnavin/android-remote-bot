import { FireStoreDB, MultiDbORM } from "multi-db-orm";
import { AndroidBot } from "./bot";
import { Firestore } from "firebase-admin/firestore";
import { PipeTask, PipeTaskDescription } from "pipelane";

const bot = new AndroidBot()

export type RemoteCommand = {
    cmd: string
    startTime: string
    endTime: number
    status: "SCHEDULED" | "COMPLETED" | "FAILED" | "IN_PROGRESS"
    output: string
}

let listener = undefined
export function initRemoteCommand(db: FireStoreDB) {
    let collection = 'android_bot_remote_cmd';
    const deviceId = process.env.DEVICE_ID || 'default_device';
    const firestoreDb = db.db as Firestore
    if (listener) {
        try {
            listener.remove()
        } catch (e) { }
    }
    // Track processed command IDs to prevent infinite loop
    const processingCommands = new Set<string>();
    listener = firestoreDb.collection(collection)
        .where('deviceId', '==', deviceId)
        .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            console.log('remote-cmd: Change detected:', change);
            if (change.type === 'added' || change.type === 'modified') {
                const commandData = change.doc.data() as RemoteCommand;
                const commandId = change.doc.id;

                // Prevent re-processing the same command
                if (processingCommands.has(commandId)) {
                    return;
                }

                if (commandData.status === 'SCHEDULED') {
                    processingCommands.add(commandId);
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
                        }).finally(() => {
                            processingCommands.delete(commandId);
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



export class RemoteCommandListerTask extends PipeTask<any, any> {

    db: FireStoreDB
    constructor(db: FireStoreDB) {
        super('restart-remote-command', 'restart-remote-command')
        this.db = db
    }
    kill(): boolean {
        return true
    }
    async execute() {
        initRemoteCommand(this.db)
        return [{ status: true }]
    }

    describe(): PipeTaskDescription | undefined {
        return {
            summary: 'Restarts the remote task listener',
            inputs: {
                last: [],
                additionalInputs: {}
            }
        }
    }
}