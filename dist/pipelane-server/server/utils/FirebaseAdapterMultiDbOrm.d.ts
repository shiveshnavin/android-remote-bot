import { FireStoreDB } from "multi-db-orm";
export declare class FirebaseAdapterMultiDbOrm extends FireStoreDB {
    insert(modelname: string, object: any, id?: string): Promise<any>;
    update(modelname: string, filter: any, object: any, id?: string): Promise<any>;
}
