import React from "react";
import { Api } from "@/common/api";
import { Theme } from "react-native-boxes";
export declare class ContextData {
    appname: string;
    initialized: boolean;
    theme: Theme;
    api: Api;
    themeName: string;
    constructor(api?: Api);
}
export declare const AppContext: React.Context<{
    context: ContextData;
    setContext: React.Dispatch<React.SetStateAction<ContextData>>;
}>;
