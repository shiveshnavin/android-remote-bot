import { MultiDbORM, MySQLDBConfig } from "multi-db-orm";
export declare const TableName: {
    PS_PIPELANE: string;
    PS_PIPELANE_TASK: string;
    PS_PIPELANE_EXEC: string;
    PS_PIPELANE_TASK_EXEC: string;
    PS_PIPELANE_META: string;
};
/**
 * Provide either db or MySQL Config
 * @param db
 * @param mysqlConfig
 */
export declare function initialzeDb(db?: MultiDbORM, mysqlConfig?: MySQLDBConfig): MultiDbORM;
