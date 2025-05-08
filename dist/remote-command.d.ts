import { FireStoreDB } from "multi-db-orm";
import { PipeTask } from "pipelane";
export type RemoteCommand = {
    cmd: string;
    startTime: string;
    endTime: number;
    status: "SCHEDULED" | "COMPLETED" | "FAILED" | "IN_PROGRESS";
    output: string;
};
export declare function initRemoteCommand(db: FireStoreDB): void;
export declare class RemoteCommandListerTask extends PipeTask<any, any> {
    db: FireStoreDB;
    constructor(db: FireStoreDB);
    kill(): boolean;
    execute(): Promise<{
        status: boolean;
    }[]>;
}
