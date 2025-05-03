import { ApolloClient, ApolloQueryResult } from '@apollo/client';
import { CreatePipelanePayload, CreatePipetaskPayload, Pipelane, Pipetask } from '../../../gen/model';
export declare function getGraphErrorMessage(error: any): any;
export declare class Api {
    graph: ApolloClient<any>;
    constructor(apolloClient: ApolloClient<any>);
    SAMPLE_PIPELANE: Pipelane;
    SAMPLE_PIPETASK: Pipetask;
    clearCache(): void;
    upsertPipelaneTask(task: CreatePipetaskPayload, oldTaskName: string): Promise<import("@apollo/client", { with: { "resolution-mode": "import" } }).FetchResult<any>>;
    upsertPipelane(pipe: CreatePipelanePayload, oldPipeName?: String): Promise<import("@apollo/client", { with: { "resolution-mode": "import" } }).FetchResult<any>>;
    getPipelaneTasks(pipeName: string): Promise<ApolloQueryResult<any>>;
    getPipelane(pipeName: string, getTasks?: Boolean): Promise<ApolloQueryResult<any>>;
    getPipetask(name: string, pipelaneName: string): Promise<ApolloQueryResult<any>>;
    clonePipelane(name: string): Promise<import("@apollo/client", { with: { "resolution-mode": "import" } }).FetchResult<any>>;
    deletePipelane(name: string): Promise<import("@apollo/client", { with: { "resolution-mode": "import" } }).FetchResult<any>>;
    executePipelane(name: string, input: string): Promise<import("@apollo/client", { with: { "resolution-mode": "import" } }).FetchResult<any>>;
    deletePipelaneTask(pipelaneName: string, name: string): Promise<import("@apollo/client", { with: { "resolution-mode": "import" } }).FetchResult<any>>;
    executions(): Promise<ApolloQueryResult<any>>;
    pipelaneExecution(id: string): Promise<ApolloQueryResult<any>>;
    pipelaneExecutions(pipelaneName: string): Promise<ApolloQueryResult<any>>;
}
export declare function createApiClient(host?: string): Api;
/**
* Recursively removes a specified field from an object.
*
* @param obj The object to remove the field from.
* @param fieldName The name of the field to remove.
* @returns The object with the specified field removed recursively.
*/
export declare function removeFieldRecursively<T>(obj: T, fieldName: string): T;
