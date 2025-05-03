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
exports.default = PipelanePage;
const Context_1 = require("@/components/Context");
const expo_router_1 = require("expo-router");
const hooks_1 = require("expo-router/build/hooks");
const react_1 = __importStar(require("react"));
const react_2 = require("react");
const react_native_boxes_1 = require("react-native-boxes");
const react_native_boxes_2 = require("react-native-boxes");
const api_1 = require("@/common/api");
const executions_1 = require("@/app/executions");
const react_3 = require("@monaco-editor/react");
function PipelanePage() {
    const theme = (0, react_2.useContext)(react_native_boxes_1.ThemeContext);
    const { pipe: pipeName } = (0, expo_router_1.useLocalSearchParams)();
    const [pipe, setPipe] = (0, react_1.useState)(undefined);
    const [err, seterr] = (0, react_1.useState)(undefined);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const appContext = (0, react_2.useContext)(Context_1.AppContext);
    const api = appContext.context.api;
    function getPipe(getTasks) {
        if (pipeName != 'new') {
            setLoading(true);
            seterr(undefined);
            api.getPipelane(pipeName, getTasks).then(result => {
                setPipe(result.data.Pipelane);
                if (!result.data.Pipelane) {
                    seterr(`No pipelane exists with name ${pipeName}`);
                }
            }).catch((error) => {
                seterr((0, api_1.getGraphErrorMessage)(error));
            }).finally(() => {
                setLoading(false);
            });
        }
        else {
            setPipe(api.SAMPLE_PIPELANE);
        }
    }
    (0, react_1.useEffect)(() => {
        getPipe();
    }, [pipeName]);
    return (react_1.default.createElement(react_native_boxes_1.VPage, null,
        err && react_1.default.createElement(react_native_boxes_2.AlertMessage, { style: {
                margin: theme.dimens.space.md,
                width: '95%'
            }, text: err, type: "critical" }),
        loading && react_1.default.createElement(react_native_boxes_2.Spinner, { style: {
                marginTop: theme.dimens.space.xl
            } }),
        pipe && react_1.default.createElement(PipelaneView, { setLoading: setLoading, seterr: seterr, pipe: pipe, save: (pipe) => {
                if (pipe.name == 'new') {
                    seterr('Please change the pipe name');
                    return;
                }
                try {
                    JSON.parse(pipe.input);
                    seterr(undefined);
                }
                catch (e) {
                    seterr('Input must be a valid JSON string');
                    return;
                }
                setLoading(true);
                seterr(undefined);
                delete pipe.nextRun;
                delete pipe.executions;
                delete pipe.updatedTimestamp;
                delete pipe.__typename;
                pipe.retryCount = parseInt(`${pipe.retryCount || 0}`);
                pipe.executionsRetentionCount = parseInt(`${pipe.executionsRetentionCount || 5}`);
                api.upsertPipelane({ ...pipe }, pipeName).then(result => {
                    setPipe(result.data.createPipelane);
                    if (result.data.createPipelane.name != pipeName) {
                        expo_router_1.router.navigate(`/home/${result.data.createPipelane.name}`);
                    }
                }).catch((error) => {
                    seterr((0, api_1.getGraphErrorMessage)(error));
                }).finally(() => {
                    setLoading(false);
                });
            } })));
}
function PipelaneView({ pipe: inputPipe, save, seterr, setLoading }) {
    const router = (0, hooks_1.useRouter)();
    const [pipe, setPipe] = (0, react_1.useState)({
        ...inputPipe,
        tasks: undefined,
        input: JSON.stringify(JSON.parse(inputPipe.input), null, 2)
    });
    (0, react_1.useEffect)(() => {
        setPipe({
            tasks: pipe.tasks,
            ...inputPipe,
            input: JSON.stringify(JSON.parse(inputPipe.input), null, 2)
        });
        getTasks();
        getExecutions();
    }, [inputPipe]);
    const [ignored, forceUpdate] = (0, react_1.useReducer)(x => x + 1, 0);
    const theme = (0, react_2.useContext)(react_native_boxes_1.ThemeContext);
    const appContext = (0, react_2.useContext)(Context_1.AppContext);
    const api = appContext.context.api;
    function getTasks() {
        api.getPipelaneTasks(pipe.name).then(result => {
            setPipe((pipe) => {
                pipe.tasks = result.data.pipelaneTasks;
                pipe.tasks?.forEach(task => {
                    delete task?.__typename;
                });
                return pipe;
            });
            forceUpdate();
        });
    }
    function getExecutions() {
        api.pipelaneExecutions(pipe.name).then((plx) => {
            setPipe(pipe => {
                pipe.executions = plx.data.pipelaneExecutions;
                return pipe;
            });
            forceUpdate();
        }).catch(e => {
            seterr((0, api_1.getGraphErrorMessage)(e));
        });
    }
    const [showDeleteConfirm, setShowDeleteConfirm] = (0, react_1.useState)(false);
    return (react_1.default.createElement(react_native_boxes_1.VBox, null,
        react_1.default.createElement(react_native_boxes_1.TransparentCenterToolbar, { options: [
                {
                    id: 'clone',
                    icon: 'copy',
                    title: 'Clone',
                    onClick: () => {
                        setLoading(true);
                        api.clonePipelane(pipe.name).then((result) => {
                            router.navigate(`/home/${result.data.clonePipelane.name}`);
                        }).catch(e => seterr((0, api_1.getGraphErrorMessage)(e))).finally(() => {
                            setLoading(false);
                        });
                    }
                },
                {
                    id: 'execute',
                    icon: 'play',
                    title: 'Execute',
                    onClick: () => {
                        setLoading(true);
                        api.executePipelane(pipe.name, pipe.input).then((result) => {
                            let executionId = result.data.executePipelane.id;
                            router.navigate('/executions/' + executionId);
                        }).catch(e => seterr((0, api_1.getGraphErrorMessage)(e))).finally(() => {
                            setLoading(false);
                        });
                    }
                },
                {
                    id: 'delete',
                    icon: 'trash',
                    title: 'Delete',
                    onClick: () => {
                        setShowDeleteConfirm(true);
                    }
                }
            ], title: pipe.name, homeIcon: "arrow-left", forgroundColor: theme.colors.text, onHomePress: () => {
                router.navigate(`/home`);
            } }),
        react_1.default.createElement(react_native_boxes_2.ConfirmationDialog, { title: "Delete ?", confirmText: "Confirm", cancelText: "Cancel", message: " This action is irreversible. Are you sure you want to delete this pipelane and all its tasks and executions?", onDismiss: () => {
                setShowDeleteConfirm(false);
            }, onConfirm: function () {
                setLoading(true);
                api.deletePipelane(pipe.name).then(() => {
                    router.navigate('/home');
                }).catch(e => seterr((0, api_1.getGraphErrorMessage)(e))).finally(() => {
                    setLoading(false);
                });
            }, visible: showDeleteConfirm }),
        react_1.default.createElement(react_native_boxes_1.CardView, null,
            react_1.default.createElement(react_native_boxes_1.HBox, { style: {
                    padding: theme.dimens.space.md,
                    justifyContent: 'space-between'
                } },
                react_1.default.createElement(react_native_boxes_1.TextView, null, "Active"),
                react_1.default.createElement(react_native_boxes_1.SwitchView, { value: pipe.active, onValueChange: (newV) => {
                        pipe.active = newV;
                        forceUpdate();
                    } })),
            react_1.default.createElement(react_native_boxes_1.HBox, { style: {
                    padding: theme.dimens.space.md,
                    justifyContent: 'space-between'
                } },
                react_1.default.createElement(react_native_boxes_1.TextView, null, "Next run"),
                react_1.default.createElement(react_native_boxes_1.TextView, null, pipe.nextRun)),
            react_1.default.createElement(react_native_boxes_1.CompositeTextInputView, { placeholder: "Pipelane name", value: pipe.name, onChangeText: (nt) => {
                    pipe.name = nt;
                    forceUpdate();
                } }),
            react_1.default.createElement(react_native_boxes_1.CompositeTextInputView, { icon: "close", placeholder: "Schedule cron", value: pipe.schedule, onChangeText: (nt) => {
                    pipe.schedule = nt;
                    forceUpdate();
                } }),
            react_1.default.createElement(react_native_boxes_1.ButtonView, { onPress: () => {
                    save(pipe);
                } }, "Save")),
        react_1.default.createElement(react_native_boxes_1.CardView, null,
            react_1.default.createElement(react_native_boxes_1.Expand, { title: "Advanced" },
                react_1.default.createElement(react_native_boxes_1.CompositeTextInputView, { placeholder: "Retry count", value: `${pipe.retryCount}`, onChangeText: (nt) => {
                        //@ts-ignore
                        pipe.retryCount = nt;
                        forceUpdate();
                    } }),
                react_1.default.createElement(react_native_boxes_1.CompositeTextInputView, { placeholder: "Number of executions to keep", value: `${pipe.executionsRetentionCount}`, onChangeText: (nt) => {
                        //@ts-ignore
                        pipe.executionsRetentionCount = nt;
                        forceUpdate();
                    } }),
                react_1.default.createElement(react_native_boxes_1.Center, { style: {
                        borderWidth: 0.1,
                        borderColor: theme.colors.caption,
                        borderRadius: 10,
                        padding: 3,
                        margin: theme.dimens.space.sm
                    } },
                    react_1.default.createElement(react_3.Editor, { onChange: (t) => {
                            pipe.input = t;
                            forceUpdate();
                        }, height: "30vh", defaultLanguage: "json", defaultValue: pipe.input, theme: theme.colors.text == '#444444' ? "light" : "vs-dark", options: {
                            tabSize: 2,
                            formatOnPaste: true,
                            formatOnType: true,
                            lineNumbers: "off",
                            wordWrap: "on",
                            minimap: { enabled: false }
                        } })))),
        pipe.updatedTimestamp != undefined && (react_1.default.createElement(react_native_boxes_1.CardView, null,
            react_1.default.createElement(react_native_boxes_1.Expand, { title: "Tasks", onExpand: () => {
                    if (pipe.tasks == undefined || pipe.tasks.length == 0)
                        getTasks();
                } },
                react_1.default.createElement(react_native_boxes_1.SimpleDatalistView, { loading: pipe.tasks == undefined, items: (pipe.tasks || []).sort((a, b) => (a?.step || 0) - (b?.step || 0)), itemAdapter: (item) => {
                        return {
                            flexRatio: [0, 9, 1],
                            action: (react_1.default.createElement(react_native_boxes_1.Icon, { onPress: () => {
                                    const index = pipe.tasks?.indexOf(item);
                                    if (index !== undefined && index >= 0) {
                                        const updatedTasks = [...pipe.tasks];
                                        if (index > 0) {
                                            updatedTasks.splice(index, 1); // Remove the item
                                            updatedTasks.splice(index - 1, 0, item); // Insert it one position to the left
                                        }
                                        else {
                                            // Move the item to the bottom
                                            updatedTasks.splice(index, 1); // Remove the item
                                            updatedTasks.push(item); // Add it to the end
                                        }
                                        // Update the steps to match their new positions
                                        updatedTasks.forEach((task, idx) => {
                                            task.step = idx;
                                        });
                                        setPipe({
                                            ...pipe,
                                            tasks: updatedTasks
                                        });
                                    }
                                }, color: theme.colors.text, name: "arrow-up" })),
                            title: item.name + (item.active ? '' : ' (Disabled)'),
                            body: `Type: ${item.taskVariantName} (${item.taskTypeName})`,
                            onPress: () => {
                                router.navigate(`/home/${item.pipelaneName}/${item.name}`);
                            }
                        };
                    } }),
                react_1.default.createElement(react_native_boxes_1.TertiaryButtonView, { text: "Create", onPress: () => {
                        router.navigate(`/home/${pipe.name}/new`);
                    } })))),
        react_1.default.createElement(react_native_boxes_1.CardView, null,
            react_1.default.createElement(react_native_boxes_1.Expand, { title: "Executions", onExpand: () => {
                    if (pipe.executions == undefined || pipe.executions.length == 0)
                        getExecutions();
                } },
                react_1.default.createElement(executions_1.PipeExecutionsView, { executions: pipe.executions, router: router })))));
}
