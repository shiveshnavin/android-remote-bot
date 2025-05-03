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
exports.default = QueryPage;
const api_1 = require("@/common/api");
const Context_1 = require("@/components/Context");
const expo_router_1 = require("expo-router");
const hooks_1 = require("expo-router/build/hooks");
const react_1 = __importStar(require("react"));
const react_2 = require("react");
const react_native_boxes_1 = require("react-native-boxes");
const ReactUtils_1 = require("../../../common/utils/ReactUtils");
function QueryPage() {
    const theme = (0, react_2.useContext)(react_native_boxes_1.ThemeContext);
    const router = (0, hooks_1.useRouter)();
    const context = (0, react_2.useContext)(Context_1.AppContext);
    const { executionId } = (0, expo_router_1.useLocalSearchParams)();
    const [execution, setExecution] = (0, react_1.useState)(undefined);
    const [err, setErr] = (0, react_1.useState)(undefined);
    const api = context.context.api;
    const [taskDetails, setTaskDetails] = (0, react_1.useState)(undefined);
    function refresh(stop) {
        api.pipelaneExecution(executionId).then(data => {
            setExecution(data.data.PipelaneExecution);
            if (data.data.PipelaneExecution.status == 'IN_PROGRESS') {
                setTimeout(refresh, 500);
            }
            else if (!stop) {
                setTimeout(() => {
                    refresh(true);
                }, 5000);
            }
        }).catch(e => {
            setErr((0, api_1.getGraphErrorMessage)(e));
        });
    }
    (0, react_1.useEffect)(() => {
        refresh();
    }, [executionId]);
    const [ignored, forceUpdate] = (0, react_1.useReducer)(x => x + 1, 0);
    return (react_1.default.createElement(react_native_boxes_1.VPage, null,
        react_1.default.createElement(react_native_boxes_1.TransparentCenterToolbar, { options: [{
                    id: 'refresh',
                    icon: 'refresh',
                    title: 'Refresh',
                    onClick: () => {
                        setExecution(undefined);
                        setTimeout(refresh, 1000);
                    }
                }], title: execution?.id || '', homeIcon: "arrow-left", forgroundColor: theme.colors.text, onHomePress: () => {
                if (router.canGoBack())
                    router.back();
                else
                    router.navigate(`/executions`);
            } }),
        react_1.default.createElement(react_native_boxes_1.Center, { style: {
                padding: 0,
                paddingBottom: theme.dimens.space.md
            } },
            react_1.default.createElement(expo_router_1.Link, { style: {
                    color: theme.colors.accent
                }, href: `/home/${execution?.name}` }, execution?.name)),
        err && react_1.default.createElement(react_native_boxes_1.AlertMessage, { type: "critical", text: err }),
        execution ? (react_1.default.createElement(react_native_boxes_1.VBox, null,
            react_1.default.createElement(react_native_boxes_1.CardView, null,
                react_1.default.createElement(react_native_boxes_1.VBox, null,
                    react_1.default.createElement(react_native_boxes_1.HBox, { style: {
                            justifyContent: 'space-between'
                        } },
                        react_1.default.createElement(react_native_boxes_1.AlertMessage, { type: execution.status == 'SUCCESS' ? 'success' : execution.status == 'FAILED' ? 'critical' : 'info', style: { width: 10 }, text: execution.status })),
                    react_1.default.createElement(react_native_boxes_1.HBox, { style: {
                            justifyContent: 'space-between'
                        } },
                        react_1.default.createElement(react_native_boxes_1.TextView, null, "Started"),
                        react_1.default.createElement(react_native_boxes_1.TextView, null, new Date(parseInt(execution.startTime)).toLocaleString())),
                    execution.endTime && react_1.default.createElement(react_native_boxes_1.HBox, { style: {
                            justifyContent: 'space-between'
                        } },
                        react_1.default.createElement(react_native_boxes_1.TextView, null, "Ended"),
                        react_1.default.createElement(react_native_boxes_1.TextView, null, new Date(parseInt(execution.endTime)).toLocaleString())))),
            react_1.default.createElement(react_native_boxes_1.Subtitle, { style: {
                    fontWeight: '900',
                    paddingStart: theme.dimens.space.lg,
                } }, "Executed Tasks"),
            react_1.default.createElement(react_native_boxes_1.SimpleDatalistView, { style: {
                    padding: theme.dimens.space.md,
                }, items: execution?.tasks || [], itemAdapter: (item, idx) => {
                    return {
                        onPress: () => {
                            setTaskDetails(item);
                        },
                        flexRatio: [0, 8, 3],
                        action: (react_1.default.createElement(react_native_boxes_1.StatusIcon, { status: item.status, colorMap: [{
                                    color: theme.colors.warning,
                                    icon: "ban",
                                    status: "SKIPPED"
                                }] })),
                        title: (react_1.default.createElement(expo_router_1.Link, { style: {
                                color: theme.colors.accent
                            }, href: `/home/${execution?.name}/${item.name}` }, item?.name)),
                        body: (`${new Date(parseInt(item.startTime)).toLocaleString()}` + (item.endTime ? ` -> ${new Date(parseInt(item.endTime)).toLocaleString()}` : ''))
                    };
                } }),
            react_1.default.createElement(react_native_boxes_1.Subtitle, { style: {
                    fontWeight: '900',
                    paddingStart: theme.dimens.space.lg,
                } }, "Output"),
            react_1.default.createElement(react_native_boxes_1.CardView, null,
                react_1.default.createElement(react_native_boxes_1.CompositeTextInputView, { editable: false, placeholder: "Outputs", textInputProps: {
                        numberOfLines: 10,
                        multiline: true,
                        style: {
                            color: theme.colors.text,
                            textAlignVertical: 'top',
                            verticalAlign: 'top',
                            alignContent: 'flex-start',
                        }
                    }, value: (0, ReactUtils_1.prettyJson)(execution.output) || '', initialText: (0, ReactUtils_1.prettyJson)(execution.output) || '' })),
            react_1.default.createElement(react_native_boxes_1.BottomSheet, { title: taskDetails?.name, visible: taskDetails != undefined, onDismiss: () => {
                    setTaskDetails(undefined);
                } },
                react_1.default.createElement(react_native_boxes_1.VBox, null,
                    react_1.default.createElement(react_native_boxes_1.CompositeTextInputView, { editable: false, placeholder: "Outputs", textInputProps: {
                            numberOfLines: 10,
                            multiline: true,
                            style: {
                                color: theme.colors.text,
                                textAlignVertical: 'top',
                                verticalAlign: 'top',
                                alignContent: 'flex-start',
                            }
                        }, value: (0, ReactUtils_1.prettyJson)(taskDetails?.output) || '', initialText: (0, ReactUtils_1.prettyJson)(taskDetails?.output) || '' }))))) : (react_1.default.createElement(react_native_boxes_1.Spinner, null))));
}
