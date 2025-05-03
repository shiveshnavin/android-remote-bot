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
exports.default = HomeLayout;
const Context_1 = require("@/components/Context");
const client_1 = require("@apollo/client");
const react_1 = __importStar(require("react"));
const react_2 = require("react");
const react_native_boxes_1 = require("react-native-boxes");
const Box_1 = require("react-native-boxes/src/Box");
const expo_router_1 = require("expo-router");
function HomeLayout() {
    const theme = (0, react_2.useContext)(react_native_boxes_1.ThemeContext);
    const appContext = (0, react_2.useContext)(Context_1.AppContext);
    const setContext = appContext.setContext;
    const api = appContext.context.api;
    const graph = appContext.context.api.graph;
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [search, setSearch] = (0, react_1.useState)("");
    const [pipes, setUsers] = (0, react_1.useState)([]);
    const router = (0, expo_router_1.useRouter)();
    const [ignored, forceUpdate] = (0, react_1.useReducer)(x => x + 1, 0);
    console.log('re-render');
    //@ts-ignores
    function getPipes(text) {
        let query = `
        query GetPipes {
            pipelanes {
              name
              schedule
              active
              nextRun
            }
          }
     `;
        graph.query({
            query: (0, client_1.gql)(query),
        }).then((result) => {
            setLoading(false);
            setUsers(result.data.pipelanes);
        });
    }
    (0, react_1.useEffect)(() => {
        getPipes(undefined);
    }, []);
    return (react_1.default.createElement(react_native_boxes_1.VPage, null,
        react_1.default.createElement(react_native_boxes_1.SimpleToolbar, { options: [
                {
                    id: 'theme',
                    icon: (react_1.default.createElement(react_native_boxes_1.Icon, { name: "lightbulb-o", color: theme.colors.text })),
                    onClick() {
                        if (appContext.context.themeName == 'dark') {
                            setContext((c) => {
                                c.themeName = "light";
                                c.theme = new react_native_boxes_1.Theme('client', react_native_boxes_1.Colors);
                                return c;
                            });
                            react_native_boxes_1.Storage.setKeyAsync('theme', 'light');
                            console.log('settign to light');
                            router.navigate('/home?theme=light');
                        }
                        else {
                            setContext((c) => {
                                c.themeName = "dark";
                                c.theme = new react_native_boxes_1.Theme('client', react_native_boxes_1.DarkColors);
                                return c;
                            });
                            react_native_boxes_1.Storage.setKeyAsync('theme', 'dark');
                            router.navigate('/home?theme=dark');
                        }
                    }
                }
            ], textStyle: {
                color: theme.colors.text
            }, backgroundColor: theme.colors.transparent, homeIcon: "", title: "Pipelanes" }),
        react_1.default.createElement(Box_1.KeyboardAvoidingScrollView, { style: {
                width: '100%'
            } },
            react_1.default.createElement(Box_1.CardView, null,
                react_1.default.createElement(Box_1.HBox, null,
                    react_1.default.createElement(react_native_boxes_1.CompositeTextInputView, { onChangeText: setSearch, initialText: search, placeholder: "Search for pipelanes", value: search, style: {
                            flex: 8
                        } }),
                    react_1.default.createElement(react_native_boxes_1.ButtonView, { onPress: () => {
                            router.navigate(`/home/new`);
                        }, style: { flex: (0, react_native_boxes_1.isDesktop)() ? 1 : 2 }, icon: "plus" }))),
            react_1.default.createElement(react_native_boxes_1.SimpleDatalistView, { loading: loading, style: {
                    padding: theme.dimens.space.sm
                }, items: pipes?.filter(p => p.name?.indexOf(search) > -1), 
                //@ts-ignore
                itemAdapter: (pipe, idx) => {
                    return {
                        onPress: () => {
                            router.navigate(`/home/${pipe.name}`);
                        },
                        action: (react_1.default.createElement(react_native_boxes_1.PressableView, { onPress: (e) => {
                                e.stopPropagation();
                            } },
                            react_1.default.createElement(react_native_boxes_1.SwitchView, { value: pipe.active == true, onValueChange: (p) => {
                                    pipe.active = p;
                                    api.upsertPipelane({
                                        active: p,
                                        name: pipe.name
                                    }).then(resp => {
                                        Object.assign(pipe, resp.data.createPipelane);
                                        forceUpdate();
                                    });
                                } }))),
                        title: pipe.name,
                        subtitle: `Schedule: ${pipe.schedule}`,
                        flexRatio: [0.1, 7, 1],
                        body: `Next run on ${pipe.nextRun}`
                    };
                } }))));
}
