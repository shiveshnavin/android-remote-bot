import { TaskVariantConfig } from "pipelane";
import { CronScheduler } from "./cron";
import { MultiDbORM, MySQLDBConfig } from "multi-db-orm";
export declare function creatPipelaneServer(variantConfig: TaskVariantConfig, persistance?: MultiDbORM | MySQLDBConfig, pipelaneLogLevel?: 0 | 1 | 2 | 3 | 4 | 5): Promise<import("express-serve-static-core").Express>;
declare let dummyResolver: {
    PipelaneExecution: {
        definition: (parent: any) => Promise<import("../gen/model").Pipetask>;
        tasks: (parent: import("../gen/model").PipelaneExecution) => Promise<any[]>;
    };
    Pipetask: {
        active: (parent: any) => any;
        isParallel: (parent: any) => any;
    };
    Pipelane: {
        active: (parent: any) => any;
        nextRun: (parent: import("../gen/model").Pipelane) => string;
        tasks: (parent: import("../gen/model").Pipelane) => Promise<any[]>;
        executions(parent: import("../gen/model").Pipelane): Promise<any[]>;
    };
    Query: {
        Pipelane: (parent: any, arg: import("../gen/model").QueryPipelaneArgs) => Promise<import("../gen/model").Pipelane>;
        Pipetask: (parent: any, arg: any) => Promise<import("../gen/model").Pipetask>;
        PipelaneExecution(pr: any, arg: import("../gen/model").QueryPipelaneExecutionArgs): Promise<any>;
        pipelanes: () => Promise<import("../gen/model").Pipelane[]>;
        pipelaneTasks: (parent: any, arg: any) => Promise<import("../gen/model").Pipetask[]>;
        executions(parent: any, request: {
            limit: number;
        }): Promise<any[]>;
        pipelaneExecutions(pr: any, arg: import("../gen/model").QueryPipelaneExecutionsArgs): Promise<import("../gen/model").PipelaneExecution[]>;
    };
    Mutation: {
        createPipelaneTask(parent: any, request: import("../gen/model").MutationCreatePipelaneTaskArgs): Promise<import("../gen/model").Pipetask>;
        clonePipelane(parent: any, request: import("../gen/model").MutationClonePipelaneArgs): Promise<import("../gen/model").Pipelane & import("../gen/model").CreatePipelanePayload>;
        createPipelane(parent: any, request: import("../gen/model").MutationCreatePipelaneArgs): Promise<import("../gen/model").Pipelane & import("../gen/model").CreatePipelanePayload>;
        deletePipelane(parent: any, request: {
            name: string;
        }): Promise<string>;
        deletePipelaneTask(parent: any, request: {
            name: string;
            pipelaneName: string;
        }): Promise<string>;
        createPipelaneExecution(parent: any, request: {
            data: import("../gen/model").PipelaneExecution;
        }): Promise<any>;
        createPipelaneTaskExecution(parent: any, request: {
            data: import("../gen/model").PipetaskExecution;
        }): Promise<any>;
        executePipelane(parent: any, request: {
            name: string;
            input: string;
        }): Promise<import("../gen/model").PipelaneExecution>;
        stopPipelane(parent: any, request: {
            id: string;
        }): Promise<import("../gen/model").PipelaneExecution>;
    };
};
export type PipelaneServerServices = {
    db: MultiDbORM;
    cron: CronScheduler;
    resolvers: typeof dummyResolver;
};
export {};
