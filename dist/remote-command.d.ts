import { FireStoreDB } from "multi-db-orm";
export type RemoteCommand = {
    cmd: string;
    startTime: string;
    endTime: number;
    status: "SCHEDULED" | "COMPLETED" | "FAILED" | "IN_PROGRESS";
    output: string;
};
export declare function initRemoteCommand(db: FireStoreDB): void;
