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
            // await this.report('fc-remote-invoke', 'invoke', credentials?.AccountID);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQXVCO0FBQ3ZCLDREQUE4QztBQUM5Qyw2REFBcUM7QUFDckMseURBQWlDO0FBQ2pDLCtDQUF5RjtBQUN6Rix3RUFBK0M7QUFFL0MsTUFBcUIsY0FBYztJQUMzQixNQUFNLENBQUMsYUFBcUIsRUFBRSxPQUFlLEVBQUUsU0FBaUI7O1lBQ3BFLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFO2dCQUNsQyxPQUFPO2dCQUNQLEdBQUcsRUFBRSxTQUFTO2FBQ2YsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBRUssYUFBYSxDQUFDLE1BQWtCOzs7WUFDcEMsTUFBTSxXQUFXLEdBQWlCLE1BQU0sSUFBSSxDQUFDLGFBQWEsT0FBQyxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsT0FBTywwQ0FBRSxNQUFNLENBQUMsQ0FBQztZQUVwRixxQkFBcUI7WUFDckIsTUFBTSxJQUFJLEdBQVcsQ0FBQyxDQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxJQUFJLEtBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLGdCQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUVwQyxNQUFNLFVBQVUsR0FBeUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUNuRSxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDO2dCQUNoQyxNQUFNLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLFdBQVcsQ0FBQztnQkFDMUcsS0FBSyxFQUFF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