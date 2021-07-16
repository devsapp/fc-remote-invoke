"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const core = __importStar(require("@serverless-devs/core"));
const logger_1 = __importDefault(require("./common/logger"));
const help_1 = __importDefault(require("./common/help"));
const entity_1 = require("./interface/entity");
// import StdoutFormatter from './common/stdout-formatter';
const remote_invoke_1 = __importDefault(require("./lib/remote-invoke"));
class FcRemoteInvoke {
    report(componentName, command, accountID) {
        return __awaiter(this, void 0, void 0, function* () {
            core.reportComponent(componentName, {
                command,
                uid: accountID,
            });
        });
    }
    handlerInputs(inputs) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            // 去除 args 的行首以及行尾的空格
            const args = ((inputs === null || inputs === void 0 ? void 0 : inputs.args) || '').replace(/(^\s*)|(\s*$)/g, '');
            logger_1.default.debug(`input args: ${args}`);
            const parsedArgs = core.commandParse({ args }, {
                boolean: ['help', 'event-stdin'],
                string: ['invocation-type', 'event', 'event-file', 'region', 'domain-name', 'service-name', 'function-name', 'qualifier'],
                alias: {
                    'help': 'h',
                    'event': 'e',
                    'event-file': 'f',
                }
            });
            const argsData = (parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs.data) || {};
            logger_1.default.debug(`command parse: ${JSON.stringify(argsData)}`);
            if (argsData.help) {
                return {
                    credentials: inputs.credentials,
                    isHelp: true,
                };
            }
            const { e: event, f: eventFile, 'event-file': eventStdin, 'invocation-type': invocationType = 'sync', 'domain-name': domainName, } = argsData;
            const eventPayload = { event, eventFile, eventStdin };
            // @ts-ignore: 判断三个值有几个真
            const eventFlag = !!event + !!eventFile + !!eventStdin;
            if (eventFlag > 1) {
                throw new Error('event | event-file | event-stdin must choose one.');
            }
            else if (eventFlag === 0) {
                eventPayload.event = '';
            }
            if (!['sync', 'async'].includes(invocationType)) {
                throw new Error('invocation-type enum value sync, async.');
            }
            if (!domainName && !(inputs === null || inputs === void 0 ? void 0 : inputs.credentials)) {
                inputs.credentials = yield core.getCredential((_a = inputs === null || inputs === void 0 ? void 0 : inputs.project) === null || _a === void 0 ? void 0 : _a.access);
            }
            logger_1.default.debug(`input props: ${JSON.stringify(inputs.props)}`);
            const props = {
                region: argsData.region || ((_b = inputs.props) === null || _b === void 0 ? void 0 : _b.region),
                serviceName: argsData['service-name'] || ((_c = inputs.props) === null || _c === void 0 ? void 0 : _c.serviceName),
                functionName: argsData['function-name'] || ((_d = inputs.props) === null || _d === void 0 ? void 0 : _d.functionName),
                domainName: domainName || ((_e = inputs.props) === null || _e === void 0 ? void 0 : _e.domainName),
                qualifier: argsData.qualifier || ((_f = inputs.props) === null || _f === void 0 ? void 0 : _f.qualifier),
            };
            logger_1.default.debug(`input args props: ${JSON.stringify(props)}`);
            if (!entity_1.isProperties(props)) {
                throw new Error('region/serviceName(service-name)/functionName(function-name) can not be empty.');
            }
            return {
                props,
                credentials: inputs.credentials,
                eventPayload,
                isHelp: false,
                invocationType: lodash_1.default.upperFirst(invocationType),
            };
        });
    }
    /**
     * event 函数本地调试
     * @param inputs
     * @returns
     */
    invoke(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            const { props, eventPayload, credentials, isHelp, invocationType, } = yield this.handlerInputs(inputs);
            yield this.report('fc-remote-invoke', 'invoke', credentials === null || credentials === void 0 ? void 0 : credentials.AccountID);
            if (isHelp) {
                core.help(help_1.default);
                return;
            }
            const remoteInvoke = new remote_invoke_1.default(props.region, credentials, props.domainName);
            yield remoteInvoke.invoke(props, eventPayload, { invocationType });
        });
    }
}
exports.default = FcRemoteInvoke;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQXVCO0FBQ3ZCLDREQUE4QztBQUM5Qyw2REFBcUM7QUFDckMseURBQWlDO0FBQ2pDLCtDQUEyRTtBQUMzRSwyREFBMkQ7QUFDM0Qsd0VBQStDO0FBRS9DLE1BQXFCLGNBQWM7SUFDM0IsTUFBTSxDQUFDLGFBQXFCLEVBQUUsT0FBZSxFQUFFLFNBQWlCOztZQUNwRSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRTtnQkFDbEMsT0FBTztnQkFDUCxHQUFHLEVBQUUsU0FBUzthQUNmLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVLLGFBQWEsQ0FBQyxNQUFrQjs7O1lBQ3BDLHFCQUFxQjtZQUNyQixNQUFNLElBQUksR0FBVyxDQUFDLENBQUEsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLElBQUksS0FBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEUsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRXBDLE1BQU0sVUFBVSxHQUF5QixJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBQ25FLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUM7Z0JBQ2hDLE1BQU0sRUFBRSxDQUFDLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQyxjQUFjLEVBQUUsZUFBZSxFQUFFLFdBQVcsQ0FBQztnQkFDeEgsS0FBSyxFQUFFO29CQUNMLE1BQU0sRUFBRSxHQUFHO29CQUNYLE9BQU8sRUFBRSxHQUFHO29CQUNaLFlBQVksRUFBRSxHQUFHO2lCQUNsQjthQUNGLENBQUMs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