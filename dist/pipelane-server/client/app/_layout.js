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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_1 = __importStar(require("react"));
const react_native_boxes_1 = require("react-native-boxes");
const expo_font_1 = require("expo-font");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const Context_1 = require("../components/Context");
const react_native_1 = require("react-native");
const expo_router_1 = require("expo-router");
const expo_router_2 = require("expo-router");
const react_native_boxes_2 = require("react-native-boxes");
const hooks_1 = require("expo-router/build/hooks");
const Box_1 = require("react-native-boxes/src/Box");
const client_1 = require("@apollo/client");
const api_1 = require("../common/api");
const axios_1 = __importDefault(require("axios"));
function Main() {
    const [context, setContext] = (0, react_1.useState)(new Context_1.ContextData());
    let basePath = '/pipelane/';
    if (__DEV__) {
        basePath = '';
    }
    context.appname = 'client';
    context.theme = new react_native_boxes_1.Theme('client', context?.themeName == "dark" ? react_native_boxes_1.DarkColors : react_native_boxes_1.Colors);
    context.theme.insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const [init, setInit] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        react_native_boxes_1.Storage.getKeyAsync('theme').then((theme) => {
            console.log('theme', theme);
            if (theme) {
                setContext(c => {
                    c.themeName = theme;
                    c.theme = new react_native_boxes_1.Theme('client', theme == "dark" ? react_native_boxes_1.DarkColors : react_native_boxes_1.Colors);
                    return c;
                });
            }
            else {
                react_native_boxes_1.Storage.setKeyAsync('theme', context.themeName);
            }
        });
        Promise.all([
            (0, expo_font_1.loadAsync)({
                'Regular': require('../assets/fonts/Regular.ttf'),
                'Bold': require('../assets/fonts/Bold.ttf'),
                'Styled': require('../assets/fonts/Bold.ttf'),
            }),
            axios_1.default.get('/pipelane/config').then((respo) => {
                let api;
                if (__DEV__) {
                    api = (0, api_1.createApiClient)('http://localhost:4001');
                }
                else {
                    api = (0, api_1.createApiClient)(respo.data.host);
                }
                setContext(c => {
                    c.api = api;
                    return c;
                });
            })
        ]).finally(() => {
            setTimeout(() => {
                setInit(true);
            }, 500);
        });
    }, []);
    react_native_1.Linking.addEventListener('url', (url) => {
        if (url?.url) {
            let path = url?.url.split("://")[1];
            if (path)
                router.navigate(path);
        }
    });
    const router = (0, expo_router_1.useRouter)();
    const [bottombarHeight, setBottomBarHeight] = (0, react_1.useState)(100);
    const [bottombarId, setBottombarId] = (0, react_1.useState)('/');
    const route = (0, hooks_1.useRouteInfo)();
    (0, react_1.useEffect)(() => {
        if (init) {
            console.log('route', route);
            let id = route.pathname.split('/')[1];
            if (id == '')
                id = 'home';
            setBottombarId(id);
            router.navigate(route.unstable_globalHref);
        }
    }, [init]);
    if (!init) {
        return (react_1.default.createElement(Box_1.Center, { style: {
                flex: 1
            } },
            react_1.default.createElement(react_native_boxes_1.Spinner, null)));
    }
    return (react_1.default.createElement(react_native_boxes_1.ThemeContext.Provider, { value: context.theme },
        react_1.default.createElement(client_1.ApolloProvider, { client: context.api?.graph },
            react_1.default.createElement(Context_1.AppContext.Provider, { value: { context, setContext } },
                react_1.default.createElement(react_native_safe_area_context_1.SafeAreaView, { style: {
                        width: '100%',
                        height: '100%'
                    } }, init && (react_1.default.createElement(react_native_boxes_2.VPage, null,
                    react_1.default.createElement(Box_1.KeyboardAvoidingScrollView, { style: {
                            width: '100%',
                            height: '100%',
                            margin: 0,
                            padding: 0,
                            paddingBottom: bottombarHeight
                        } },
                        react_1.default.createElement(expo_router_2.Slot, null)),
                    react_1.default.createElement(react_native_boxes_2.BottomNavBar, { onDimens: (w, h) => {
                            setBottomBarHeight(h);
                        }, selectedId: bottombarId, onSelect: (id) => {
                            router.navigate(basePath + id);
                            setBottombarId(id);
                        }, options: [{
                                id: 'home',
                                icon: 'home',
                                title: 'Home'
                            },
                            {
                                id: 'executions',
                                icon: 'plane',
                                title: 'Executions'
                            }] }))))))));
}
function App() {
    return (react_1.default.createElement(react_native_safe_area_context_1.SafeAreaProvider, null,
        react_1.default.createElement(Main, null)));
}
