"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
exports.getGraphErrorMessage = getGraphErrorMessage;
exports.createApiClient = createApiClient;
exports.removeFieldRecursively = removeFieldRecursively;
const client_1 = require("@apollo/client");
const defaultOptions = {
    watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
    },
    query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
};
function getGraphErrorMessage(error) {
    try {
        console.log(error);
        if (error?.networkError?.result)
            error = error.networkError.result;
        else if (error.message) {
            return error.message;
        }
        if (error.errors && error.errors.length > 0) {
            return error.errors.map((e) => {
                return e.message;
            }).join(". ");
        }
    }
    catch (e) {
        return "An error occurred";
    }
    return undefined;
}
class Api {
    graph;
    constructor(apolloClient) {
        this.graph = apolloClient;
    }
    SAMPLE_PIPELANE = {
        name: 'new',
        active: true,
        input: `{}`,
        retryCount: 0,
        executionsRetentionCount: 5,
        schedule: '0 8 * * *',
        tasks: [],
    };
    SAMPLE_PIPETASK = {
        name: 'new',
        taskTypeName: 'new',
        taskVariantName: 'new',
        active: true,
        input: `{}`,
        pipelaneName: 'new',
        isParallel: false
    };
    clearCache() {
        this.graph.clearStore();
    }
    upsertPipelaneTask(task, oldTaskName) {
        this.clearCache();
        return this.graph.mutate({
            mutation: (0, client_1.gql) `mutation Mutation($data: CreatePipetaskPayload!, $oldTaskName: ID) {
                createPipelaneTask(data: $data, oldTaskName: $oldTaskName) {
                  name
                  pipelaneName
                  taskTypeName
                  taskVariantName
                  active
                  isParallel
                  step
                  input
                }
              }`,
            variables: {
                oldTaskName: oldTaskName,
                data: task
            }
        });
    }
    upsertPipelane(pipe, oldPipeName) {
        this.clearCache();
        return this.graph.mutate({
            mutation: (0, client_1.gql) `mutation Mutation($data: CreatePipelanePayload!, $oldPipeName: ID) {
                createPipelane(data: $data, oldPipeName: $oldPipeName) {
                  name
                  active
                  schedule
                  input
                  nextRun
                  retryCount
                  executionsRetentionCount
                  updatedTimestamp
                }
              }`,
            variables: {
                oldPipeName,
                data: pipe
            }
        });
    }
    getPipelaneTasks(pipeName) {
        return this.graph.query({
            query: (0, client_1.gql) `
                query PipelaneTasks($pipelaneName: ID!) {
                        pipelaneTasks(pipelaneName: $pipelaneName) {
                            name
                            pipelaneName
                            taskVariantName
                            taskTypeName
                            isParallel
                            step
                            input
                            active
                        }
                    }
`,
            variables: { pipelaneName: pipeName },
        });
    }
    getPipelane(pipeName, getTasks) {
        return this.graph.query({
            query: (0, client_1.gql) `
                query Pipelane($name: ID!) {
                        Pipelane(name: $name) {
                            name
                            input
                            schedule
                            active
                            nextRun
                            retryCount
                            executionsRetentionCount
                            updatedTimestamp
                            ${getTasks ? `
                                tasks {
                                pipelaneName
                                taskVariantName
                                taskTypeName
                                isParallel
                                step
                                input
                                }` : ''}
                        }
                    }
`,
            variables: { name: pipeName },
        });
    }
    getPipetask(name, pipelaneName) {
        return this.graph.query({
            query: (0, client_1.gql) `
                        query PipeTasks($name: ID!, $taskVariantName: ID!, $pipelaneName: ID!) {
                        Pipetask(name: $name, pipelaneName: $pipelaneName) {
                            name
                            pipelaneName
                            taskVariantName
                            taskTypeName
                            isParallel
                            step
                            input
                            active
                        }
                        }
                                    
                        `,
            variables: {
                "name": name,
                "pipelaneName": pipelaneName
            },
        });
    }
    clonePipelane(name) {
        this.clearCache();
        return this.graph.mutate({
            mutation: (0, client_1.gql) `mutation clonePipelane($name: ID!) {
                clonePipelane(name: $name) {
                    name
                }
              }
              `,
            variables: {
                name
            }
        });
    }
    deletePipelane(name) {
        this.clearCache();
        return this.graph.mutate({
            mutation: (0, client_1.gql) `mutation DeletePipelane($name: ID!) {
                deletePipelane(name: $name)
              }
              `,
            variables: {
                name
            }
        });
    }
    executePipelane(name, input) {
        this.clearCache();
        return this.graph.mutate({
            mutation: (0, client_1.gql) `mutation executePipelane($name: ID!, $input: String!) {
                executePipelane(name: $name, input: $input){
                    id
                }
              }
              `,
            variables: {
                name,
                input
            }
        });
    }
    deletePipelaneTask(pipelaneName, name) {
        this.clearCache();
        return this.graph.mutate({
            mutation: (0, client_1.gql) `
            mutation DeletePipelaneTask($pipelaneName: ID!, $name: ID!) {
                deletePipelaneTask(pipelaneName: $pipelaneName, name: $name)
              }
              `,
            variables: {
                pipelaneName,
                name
            }
        });
    }
    executions() {
        return this.graph.query({
            query: (0, client_1.gql) `
                query Executions {
                    executions {
                        id
                        name
                        startTime
                        status
                        endTime
                    }
                }
            `
        });
    }
    pipelaneExecution(id) {
        return this.graph.query({
            query: (0, client_1.gql) `
                query Execution($id: ID!) {
                    PipelaneExecution(id: $id) {
                        id
                        name
                        output
                        startTime
                        status
                        endTime
                        tasks {
                            id
                            name
                            output
                            startTime
                            status
                            endTime
                        }
                    }
                }
            `,
            variables: {
                id
            }
        });
    }
    pipelaneExecutions(pipelaneName) {
        return this.graph.query({
            query: (0, client_1.gql) `
                query Executions($pipelaneName: ID!) {
                    pipelaneExecutions(pipelaneName: $pipelaneName) {
                        id
                        name
                        startTime
                        status
                        endTime
                    }
                }
            `,
            variables: {
                pipelaneName
            }
        });
    }
}
exports.Api = Api;
function createApiClient(host) {
    const client = new client_1.ApolloClient({
        uri: (host ? host : '') + '/pipelane/graph',
        cache: new client_1.InMemoryCache(),
        defaultOptions: defaultOptions,
    });
    return new Api(client);
}
/**
* Recursively removes a specified field from an object.
*
* @param obj The object to remove the field from.
* @param fieldName The name of the field to remove.
* @returns The object with the specified field removed recursively.
*/
function removeFieldRecursively(obj, fieldName) {
    // If the object is null or not an object type, return it as is.
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    // If the object is an array, iterate through it and apply the function to each element.
    if (Array.isArray(obj)) {
        return obj.map(item => removeFieldRecursively(item, fieldName));
    }
    // If the object is a regular object, iterate through its keys.
    const newObj = {};
    for (const key in obj) {
        // Check if the key is directly on the object (not inherited).
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // If the current key matches the fieldName, skip it (effectively removing it).
            if (key === fieldName) {
                continue;
            }
            // Get the value of the current key.
            const value = obj[key];
            // Recursively call the function on the value if it's an object or array.
            newObj[key] = removeFieldRecursively(value, fieldName);
        }
    }
    return newObj;
}
