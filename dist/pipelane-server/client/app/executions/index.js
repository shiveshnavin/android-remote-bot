"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExecutionsPage;
exports.PipeExecutionsView = PipeExecutionsView;
const expo_router_1 = require("expo-router");
const react_1 = __importStar(require("react"));
const react_2 = require("react");
const react_native_boxes_1 = require("react-native-boxes");
const Context_1 = require("../../components/Context");
const api_1 = require("../../common/api");
function ExecutionsPage() {
    const theme = (0, react_2.useContext)(react_native_boxes_1.ThemeContext);
    const router = (0, expo_router_1.useRouter)();
    const context = (0, react_2.useContext)(Context_1.AppContext);
    const [executions, setExecutions] = (0, react_1.useState)(undefined);
    const [err, setErr] = (0, react_1.useState)(undefined);
    const api = context.context.api;
    (0, react_1.useEffect)(() => {
        api.executions().then(data => {
            setExecutions(data.data.executions);
        }).catch(e => {
            setErr((0, api_1.getGraphErrorMessage)(e));
        });
    }, []);
    return (react_1.default.createElement(react_native_boxes_1.VPage, null,
        react_1.default.createElement(react_native_boxes_1.TransparentCenterToolbar, { title: "Executions", homeIcon: "arrow-left", forgroundColor: theme.colors.text, onHomePress: () => {
                router.navigate(`/home`);
            } }),
        err && react_1.default.createElement(react_native_boxes_1.AlertMessage, { type: "critical", text: err }),
        react_1.default.createElement(PipeExecutionsView, { executions: executions, router: router })));
}
function PipeExecutionsView({ executions, router }) {
    const theme = (0, react_2.useContext)(react_native_boxes_1.ThemeContext);
    return (react_1.default.createElement(react_native_boxes_1.SimpleDatalistView, { loading: executions == undefined, items: executions || [], itemAdapter: (item, idx) => {
            let criticality = item.status == 'SUCCESS' ? 'success' :
                item.status == 'FAILED' ? 'critical' : 'info';
            return {
                onPress: () => {
                    router.navigate(`/executions/${item.id}`);
                },
                flexRatio: [0, 8, 2],
                action: (react_1.default.createElement(react_native_boxes_1.StatusIcon, { status: item.status, colorMap: [{
                            color: theme.colors.warning,
                            icon: "ban",
                            status: "SKIPPED"
                        }] })),
                title: item.id,
                body: (`${new Date(parseInt(item.startTime)).toLocaleString()}` + (item.endTime ? ` -> ${new Date(parseInt(item.endTime)).toLocaleString()}` : ''))
            };
        } }));
}
