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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const credentials = yield core.getCredential((_a = inputs === null || inputs === void 0 ? void 0 : inputs.project) === null || _a === void 0 ? void 0 : _a.access);
            // 去除 args 的行首以及行尾的空格
            const args = ((inputs === null || inputs === void 0 ? void 0 : inputs.args) || '').replace(/(^\s*)|(\s*$)/g, '');
            logger_1.default.debug(`input args: ${args}`);
            const parsedArgs = core.commandParse({ args }, {
                boolean: ['help', 'event-stdin'],
                string: ['invocation-type', 'event', 'event-file', 'region', 'service-name', 'function-name', 'qualifier'],
                alias: {
                    'help': 'h',
                    'event': 'e',
                    'invocation-type': 't',
                    'event-file': 'f',
                    'event-stdin': 's',
                }
            });
            const argsData = (parsedArgs === null || parsedArgs === void 0 ? void 0 : parsedArgs.data) || {};
            logger_1.default.debug(`command parse: ${JSON.stringify(argsData)}`);
            if (argsData.help) {
                return {
                    credentials,
                    isHelp: true,
                };
            }
            // await StdoutFormatter.initStdout();
            const { e: event, f: eventFile, s: eventStdin, t: invocationType = 'sync', } = argsData;
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
            logger_1.default.debug(`input props: ${JSON.stringify(inputs.props)}`);
            let props = {
                region: argsData.region,
                serviceName: argsData['service-name'],
                functionName: argsData['function-name'],
            };
            logger_1.default.debug(`input args props: ${JSON.stringify(props)}`);
            if (!entity_1.isProperties(props)) {
                props = inputs.props;
            }
            logger_1.default.debug(`props: ${JSON.stringify(props)}`);
            if (!entity_1.isProperties(props)) {
                throw new Error('region/serviceName(service-name)/functionName(function-name) can not be empty.');
            }
            props.qualifier = argsData.qualifier || ((_b = inputs.props) === null || _b === void 0 ? void 0 : _b.qualifier);
            return {
                props,
                credentials,
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
            const remoteInvoke = new remote_invoke_1.default(props.region, credentials);
            yield remoteInvoke.invoke(props, eventPayload, { invocationType });
        });
    }
}
exports.default = FcRemoteInvoke;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQXVCO0FBQ3ZCLDREQUE4QztBQUM5Qyw2REFBcUM7QUFDckMseURBQWlDO0FBQ2pDLCtDQUF5RjtBQUN6RiwyREFBMkQ7QUFDM0Qsd0VBQStDO0FBRS9DLE1BQXFCLGNBQWM7SUFDM0IsTUFBTSxDQUFDLGFBQXFCLEVBQUUsT0FBZSxFQUFFLFNBQWlCOztZQUNwRSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRTtnQkFDbEMsT0FBTztnQkFDUCxHQUFHLEVBQUUsU0FBUzthQUNmLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVLLGFBQWEsQ0FBQyxNQUFrQjs7O1lBQ3BDLE1BQU0sV0FBVyxHQUFpQixNQUFNLElBQUksQ0FBQyxhQUFhLE9BQUMsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLE9BQU8sMENBQUUsTUFBTSxDQUFDLENBQUM7WUFFcEYscUJBQXFCO1lBQ3JCLE1BQU0sSUFBSSxHQUFXLENBQUMsQ0FBQSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsSUFBSSxLQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4RSxnQkFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLElBQUksRUFBRSxDQUFDLENBQUM7WUFFcEMsTUFBTSxVQUFVLEdBQXlCLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDbkUsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQztnQkFDaEMsTUFBTSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxXQUFXLENBQUM7Z0JB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