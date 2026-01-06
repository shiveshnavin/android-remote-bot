import { MultiDbORM } from "multi-db-orm";
import { TaskVariantConfig } from "pipelane";
import { MutationClonePipelaneArgs, MutationCreatePipelaneArgs, MutationCreatePipelaneTaskArgs, Pipelane, PipelaneExecution, Pipetask, PipetaskExecution, QueryPipelaneArgs, QueryPipelaneExecutionArgs, QueryPipelaneExecutionsArgs } from "../../gen/model";
import { CronScheduler } from "../cron";
export declare function generatePipelaneResolvers(db: MultiDbORM, variantConfig: TaskVariantConfig, cronScheduler?: CronScheduler, defaultExecutionRetentionCountPerPipe?: number): {
    PipelaneExecution: {
        definition: (parent: any) => Promise<Pipetask>;
        tasks: (parent: PipelaneExecution) => Promise<any[]>;
    };
    Pipetask: {
        active: (parent: any) => any;
        isParallel: (parent: any) => any;
    };
    Pipelane: {
        active: (parent: any) => any;
        nextRun: (parent: Pipelane) => string;
        tasks: (parent: Pipelane) => Promise<any[]>;
        executions(parent: Pipelane): Promise<any[]>;
    };
    Query: {
        Pipelane: (parent: any, arg: QueryPipelaneArgs) => Promise<Pipelane>;
        Pipetask: (parent: any, arg: any) => Promise<Pipetask>;
        PipelaneExecution(pr: any, arg: QueryPipelaneExecutionArgs): Promise<any>;
        pipelanes: () => Promise<Pipelane[]>;
        pipelaneTasks: (parent: any, arg: any) => Promise<Pipetask[]>;
        executions(parent: any, request: {
            limit: number;
        }): Promise<any[]>;
        pipelaneExecutions(pr: any, arg: QueryPipelaneExecutionsArgs): Promise<PipelaneExecution[]>;
    };
    Mutation: {
        createPipelaneTask(parent: any, request: MutationCreatePipelaneTaskArgs): Promise<Pipetask>;
        clonePipelane(parent: any, request: MutationClonePipelaneArgs): Promise<Pipelane & import("../../gen/model").CreatePipelanePayload>;
        createPipelane(parent: any, request: MutationCreatePipelaneArgs): Promise<Pipelane & import("../../gen/model").CreatePipelanePayload>;
        deletePipelane(parent: any, request: {
            name: string;
        }): Promise<string>;
        deletePipelaneTask(parent: any, request: {
            name: string;
            pipelaneName: string;
        }): Promise<string>;
        /**
         * Called every time regardless via GraphQL (executePipelane) or Cron
         * @param parent
         * @param request
         * @returns
         */
        createPipelaneExecution(parent: any, request: {
            data: PipelaneExecution;
        }): Promise<any>;
        createPipelaneTaskExecution(parent: any, request: {
            data: PipetaskExecution;
        }): Promise<any>;
        executePipelane(parent: any, request: {
            name: string;
            input: string;
        }): Promise<PipelaneExecution>;
        stopPipelane(parent: any, request: {
            id: string;
        }): Promise<PipelaneExecution>;
    };
};
