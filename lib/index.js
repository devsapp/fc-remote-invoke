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
const client_1 = __importDefault(require("./lib/client"));
class FcRemoteInvoke {
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
            let fcClient;
            if (!props.domainName) {
                fcClient = yield client_1.default.buildFcClient(props.region, credentials);
            }
            const remoteInvoke = new remote_invoke_1.default(fcClient, credentials.AccountID);
            yield remoteInvoke.invoke(props, eventPayload, { invocationType });
        });
    }
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
            const parsedArgs = core.commandParse(Object.assign(Object.assign({}, inputs), { args }), {
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
            const { e: event, f: eventFile, 'event-stdin': eventStdin, 'invocation-type': invocationType = 'sync', 'domain-name': domainName, } = argsData;
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
}
exports.default = FcRemoteInvoke;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQXVCO0FBQ3ZCLDREQUE4QztBQUM5Qyw2REFBcUM7QUFDckMseURBQWlDO0FBQ2pDLCtDQUEyRTtBQUMzRSwyREFBMkQ7QUFDM0Qsd0VBQStDO0FBQy9DLDBEQUFrQztBQUVsQyxNQUFxQixjQUFjO0lBQ2pDOzs7O09BSUc7SUFDRyxNQUFNLENBQUMsTUFBa0I7O1lBQzdCLE1BQU0sRUFDSixLQUFLLEVBQ0wsWUFBWSxFQUNaLFdBQVcsRUFDWCxNQUFNLEVBQ04sY0FBYyxHQUNmLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsV0FBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRXhFLElBQUksTUFBTSxFQUFFO2dCQUNWLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBSSxDQUFDLENBQUM7Z0JBQ2hCLE9BQU87YUFDUjtZQUVELElBQUksUUFBUSxDQUFDO1lBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUU7Z0JBQ3JCLFFBQVEsR0FBRyxNQUFNLGdCQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDbEU7WUFDRCxNQUFNLFlBQVksR0FBRyxJQUFJLHVCQUFZLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2RSxNQUFNLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDckUsQ0FBQztLQUFBO0lBRWEsTUFBTSxDQUFDLGFBQXFC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