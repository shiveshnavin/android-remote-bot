export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<T extends {
    [key: string]: unknown;
}, K extends keyof T> = {
    [_ in K]?: never;
};
export type Incremental<T> = T | {
    [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: {
        input: string;
        output: string;
    };
    String: {
        input: string;
        output: string;
    };
    Boolean: {
        input: boolean;
        output: boolean;
    };
    Int: {
        input: number;
        output: number;
    };
    Float: {
        input: number;
        output: number;
    };
    ANY: {
        input: any;
        output: any;
    };
};
export type CreatePipelanePayload = {
    active?: InputMaybe<Scalars['Boolean']['input']>;
    executionsRetentionCount?: InputMaybe<Scalars['Int']['input']>;
    input?: InputMaybe<Scalars['String']['input']>;
    name: Scalars['ID']['input'];
    retryCount?: InputMaybe<Scalars['Int']['input']>;
    schedule?: InputMaybe<Scalars['String']['input']>;
    tasks?: InputMaybe<Array<InputMaybe<CreatePipetaskPayload>>>;
};
export type CreatePipetaskPayload = {
    active?: InputMaybe<Scalars['Boolean']['input']>;
    input?: InputMaybe<Scalars['String']['input']>;
    isParallel?: InputMaybe<Scalars['Boolean']['input']>;
    name: Scalars['ID']['input'];
    pipelaneName: Scalars['ID']['input'];
    step?: InputMaybe<Scalars['Int']['input']>;
    taskTypeName: Scalars['ID']['input'];
    taskVariantName?: InputMaybe<Scalars['String']['input']>;
};
export type Mutation = {
    __typename?: 'Mutation';
    clonePipelane: Pipelane;
    createPipelane: Pipelane;
    createPipelaneExecution: PipelaneExecution;
    createPipelaneTask: Pipetask;
    createPipelaneTaskExecution: PipetaskExecution;
    deletePipelane: Status;
    deletePipelaneTask: Status;
    executePipelane: PipetaskExecution;
};
export type MutationClonePipelaneArgs = {
    name: Scalars['ID']['input'];
};
export type MutationCreatePipelaneArgs = {
    data: CreatePipelanePayload;
    oldPipeName?: InputMaybe<Scalars['ID']['input']>;
};
export type MutationCreatePipelaneExecutionArgs = {
    data: PipelaneExecutionPayload;
};
export type MutationCreatePipelaneTaskArgs = {
    data: CreatePipetaskPayload;
    oldTaskName?: InputMaybe<Scalars['ID']['input']>;
};
export type MutationCreatePipelaneTaskExecutionArgs = {
    data: PipetaskExecutionPayload;
};
export type MutationDeletePipelaneArgs = {
    name: Scalars['ID']['input'];
};
export type MutationDeletePipelaneTaskArgs = {
    name: Scalars['ID']['input'];
    pipelaneName: Scalars['ID']['input'];
};
export type MutationExecutePipelaneArgs = {
    input?: InputMaybe<Scalars['String']['input']>;
    name: Scalars['ID']['input'];
};
export type Pipelane = {
    __typename?: 'Pipelane';
    active?: Maybe<Scalars['Boolean']['output']>;
    executions?: Maybe<Array<Maybe<PipelaneExecution>>>;
    executionsRetentionCount?: Maybe<Scalars['Int']['output']>;
    input?: Maybe<Scalars['String']['output']>;
    name: Scalars['ID']['output'];
    nextRun?: Maybe<Scalars['String']['output']>;
    retryCount?: Maybe<Scalars['Int']['output']>;
    schedule?: Maybe<Scalars['String']['output']>;
    tasks?: Maybe<Array<Maybe<Pipetask>>>;
    updatedTimestamp?: Maybe<Scalars['String']['output']>;
};
export declare enum PipelaneAction {
    Create = "CREATE",
    Update = "UPDATE"
}
export type PipelaneExecution = {
    __typename?: 'PipelaneExecution';
    definition?: Maybe<Pipelane>;
    endTime?: Maybe<Scalars['String']['output']>;
    id: Scalars['ID']['output'];
    name: Scalars['ID']['output'];
    output?: Maybe<Scalars['String']['output']>;
    startTime?: Maybe<Scalars['String']['output']>;
    status?: Maybe<Status>;
    tasks?: Maybe<Array<Maybe<PipetaskExecution>>>;
};
export type PipelaneExecutionPayload = {
    endTime?: InputMaybe<Scalars['String']['input']>;
    id: Scalars['ID']['input'];
    name: Scalars['ID']['input'];
    output?: InputMaybe<Scalars['String']['input']>;
    startTime?: InputMaybe<Scalars['String']['input']>;
    status?: InputMaybe<Status>;
};
export type PipelaneMeta = {
    __typename?: 'PipelaneMeta';
    pkey: Scalars['ID']['output'];
    pval?: Maybe<Scalars['String']['output']>;
};
export type Pipetask = {
    __typename?: 'Pipetask';
    active?: Maybe<Scalars['Boolean']['output']>;
    executions?: Maybe<Array<Maybe<PipetaskExecution>>>;
    input?: Maybe<Scalars['String']['output']>;
    isParallel?: Maybe<Scalars['Boolean']['output']>;
    name: Scalars['ID']['output'];
    pipelaneName: Scalars['ID']['output'];
    step?: Maybe<Scalars['Int']['output']>;
    taskTypeName: Scalars['ID']['output'];
    taskVariantName?: Maybe<Scalars['String']['output']>;
};
export type PipetaskExecution = {
    __typename?: 'PipetaskExecution';
    definition?: Maybe<Pipetask>;
    endTime?: Maybe<Scalars['String']['output']>;
    id: Scalars['ID']['output'];
    name: Scalars['ID']['output'];
    output?: Maybe<Scalars['String']['output']>;
    pipelaneExId: Scalars['ID']['output'];
    pipelaneName: Scalars['ID']['output'];
    startTime?: Maybe<Scalars['String']['output']>;
    status?: Maybe<Status>;
};
export type PipetaskExecutionPayload = {
    endTime?: InputMaybe<Scalars['String']['input']>;
    id: Scalars['ID']['input'];
    name: Scalars['ID']['input'];
    output?: InputMaybe<Scalars['String']['input']>;
    pipelaneExId: Scalars['ID']['input'];
    pipelaneName: Scalars['ID']['input'];
    startTime?: InputMaybe<Scalars['String']['input']>;
    status?: InputMaybe<Status>;
};
export type Query = {
    __typename?: 'Query';
    Pipelane?: Maybe<Pipelane>;
    PipelaneExecution?: Maybe<PipelaneExecution>;
    Pipetask?: Maybe<Pipetask>;
    TaskType?: Maybe<TaskType>;
    executions?: Maybe<Array<Maybe<PipelaneExecution>>>;
    pipelaneExecutions?: Maybe<Array<Maybe<PipelaneExecution>>>;
    pipelaneTasks?: Maybe<Array<Maybe<Pipetask>>>;
    pipelanes?: Maybe<Array<Maybe<Pipelane>>>;
    taskTypes?: Maybe<Array<Maybe<TaskType>>>;
};
export type QueryPipelaneArgs = {
    name: Scalars['ID']['input'];
};
export type QueryPipelaneExecutionArgs = {
    id: Scalars['ID']['input'];
};
export type QueryPipetaskArgs = {
    name: Scalars['ID']['input'];
    pipelaneName: Scalars['ID']['input'];
};
export type QueryTaskTypeArgs = {
    type: Scalars['ID']['input'];
};
export type QueryExecutionsArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
};
export type QueryPipelaneExecutionsArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
    pipelaneName: Scalars['ID']['input'];
};
export type QueryPipelaneTasksArgs = {
    pipelaneName: Scalars['ID']['input'];
};
export type QueryPipelanesArgs = {
    search?: InputMaybe<Scalars['String']['input']>;
};
export declare enum Status {
    Failed = "FAILED",
    InProgress = "IN_PROGRESS",
    PartialSuccess = "PARTIAL_SUCCESS",
    Paused = "PAUSED",
    Skipped = "SKIPPED",
    Success = "SUCCESS"
}
export type TaskType = {
    __typename?: 'TaskType';
    description?: Maybe<TaskTypeDescription>;
    type: Scalars['ID']['output'];
    variants?: Maybe<Array<Maybe<Scalars['ID']['output']>>>;
};
export type TaskTypeDescription = {
    __typename?: 'TaskTypeDescription';
    inputs?: Maybe<TaskTypeInput>;
    summary?: Maybe<Scalars['String']['output']>;
};
export type TaskTypeInput = {
    __typename?: 'TaskTypeInput';
    additionalInputs?: Maybe<Scalars['ANY']['output']>;
    last?: Maybe<Array<Maybe<Scalars['ANY']['output']>>>;
};
