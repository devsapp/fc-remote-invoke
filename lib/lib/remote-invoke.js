"use strict";
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
const client_1 = __importDefault(require("./client"));
const event_1 = __importDefault(require("./event"));
const logger_1 = __importDefault(require("../common/logger"));
class RemoteInvoke {
    constructor(region, credentials) {
        this.accountId = credentials.AccountID;
        this.fcClient = client_1.default.buildFcClient(region, credentials);
    }
    invoke(props, eventPayload, { invocationType }) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield event_1.default.eventPriority(eventPayload);
            logger_1.default.debug(`event: ${event}`);
            const { region, serviceName, functionName, qualifier, } = props;
            const httpTriggers = yield this.getHttpTrigger(serviceName, functionName);
            const payload = { event, serviceName, functionName, qualifier };
            if (lodash_1.default.isEmpty(httpTriggers)) {
                payload.invocationType = invocationType;
                payload.event = event;
                yield this.eventInvoke(payload);
            }
            else {
                payload.region = region;
                try {
                    payload.event = event ? JSON.parse(event) : {};
                }
                catch (ex) {
                    logger_1.default.debug(ex);
                    throw new Error('handler event error. Example: https://github.com/devsapp/fc-remote-invoke/blob/master/example/http.json');
                }
                yield this.httpInvoke(payload);
            }
        });
    }
    getHttpTrigger(serviceName, functionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.fcClient.listTriggers(serviceName, functionName);
            logger_1.default.debug(`get listTriggers: ${JSON.stringify(data)}`);
            if (lodash_1.default.isEmpty(data.triggers)) {
                return [];
            }
            const httpTrigger = data.triggers.filter(t => t.triggerType === 'http' || t.triggerType === 'https');
            if (lodash_1.default.isEmpty(httpTrigger)) {
                return [];
            }
            return httpTrigger;
        });
    }
    eventInvoke({ serviceName, functionName, event, qualifier = 'LATEST', invocationType }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (invocationType === 'Sync') {
                const rs = yield this.fcClient.invokeFunction(serviceName, functionName, event, {
                    'X-Fc-Log-Type': 'Tail',
                    'X-Fc-Invocation-Type': invocationType
                }, qualifier);
                const log = rs.headers['x-fc-log-result'];
                if (log) {
                    logger_1.default.log('========= FC invoke Logs begin =========', 'yellow');
                    const decodedLog = Buffer.from(log, 'base64');
                    logger_1.default.log(decodedLog.toString());
                    logger_1.default.log('========= FC invoke Logs end =========', 'yellow');
                    logger_1.default.log('\nFC Invoke Result:', 'green');
                    console.log(rs.data);
                    console.log('\n');
                }
            }
            else {
                yield this.fcClient.invokeFunction(serviceName, functionName, event, {
                    'X-Fc-Invocation-Type': invocationType
                }, qualifier);
                logger_1.default.log('`${serviceName}/${functionName} async invoke success.\n`', 'green');
            }
        });
    }
    httpInvoke({ region, serviceName, functionName, event, qualifier }) {
        return __awaiter(this, void 0, void 0, function* () {
            const q = qualifier ? `.${qualifier}` : '';
            event.path = `/proxy/${serviceName}${q}/${functionName}/${event.path || ''}`;
            logger_1.default.log(`https://${this.accountId}.${region}.fc.aliyuncs.com/2016-08-15/proxy/${serviceName}${q}/${functionName}/`);
            yield this.request(event);
        });
    }
    /**
     * @param event: { body, headers, method, queries, path }
     * path 组装后的路径 /proxy/serviceName/functionName/path ,
     */
    request(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { headers, queries, method, path: p, body } = this.handlerHttpParmase(event);
            let resp;
            try {
                const mt = method.toLocaleUpperCase();
                logger_1.default.debug(`method is ${mt}.`);
                logger_1.default.debug(`start invoke.`);
                if (mt === 'GET') {
                    resp = yield this.fcClient.get(p, queries, headers);
                }
                else if (mt === 'POST') {
                    resp = yield this.fcClient.post(p, body, headers, queries);
                }
                else if (mt === 'PUT') {
                    resp = yield this.fcClient.put(p, body, headers);
                }
                else if (mt === 'DELETE') {
                    resp = yield this.fcClient.request('DELETE', p, queries, null, headers);
                    /* else if (method.toLocaleUpperCase() === 'PATCH') {
                    resp = await this.fcClient.request('PATCH', p, queries, body, headers);
                  } else if (method.toLocaleUpperCase() === 'HEAD') {
                    resp = await this.fcClient.request('HEAD', p, queries, body, headers);
                  } */
                }
                else {
                    logger_1.default.log(`Does not support ${method} requests temporarily.`);
                }
            }
            catch (e) {
                logger_1.default.debug(e);
                throw e;
            }
            logger_1.default.debug(`end invoke.`);
            if (resp) {
                const log = resp.headers['x-fc-log-result'];
                if (log) {
                    logger_1.default.log('\n========= FC invoke Logs begin =========', 'yellow');
                    const decodedLog = Buffer.from(log, 'base64');
                    logger_1.default.log(decodedLog.toString());
                    logger_1.default.log('========= FC invoke Logs end =========', 'yellow');
                }
                logger_1.default.log('\nFC Invoke Result:', 'green');
                console.log(resp.data);
                console.log('\n');
            }
        });
    }
    handlerHttpParmase(event) {
        const { body = '', headers = {}, method = 'GET', queries = '', path: p = '' } = event;
        let postBody;
        if (body) {
            let buff = null;
            if (Buffer.isBuffer(body)) {
                buff = body;
                headers['content-type'] = 'application/octet-stream';
            }
            else if (typeof body === 'string') {
                buff = Buffer.from(body, 'utf8');
                headers['content-type'] = 'application/octet-stream';
            }
            else if (typeof body.pipe === 'function') {
                buff = body;
                headers['content-type'] = 'application/octet-stream';
            }
            else {
                buff = Buffer.from(JSON.stringify(body), 'utf8');
                headers['content-type'] = 'application/json';
            }
            postBody = buff;
        }
        if (!headers['X-Fc-Log-Type']) {
            headers['X-Fc-Log-Type'] = 'Tail';
        }
        return {
            headers,
            queries,
            method,
            path: p,
            body: postBody
        };
    }
}
exports.default = RemoteInvoke;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlLWludm9rZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcmVtb3RlLWludm9rZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLG9EQUF1QjtBQUN2QixzREFBOEI7QUFFOUIsb0RBQTRCO0FBQzVCLDhEQUFzQztBQUV0QyxNQUFxQixZQUFZO0lBSS9CLFlBQVksTUFBYyxFQUFFLFdBQVc7UUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLEdBQUcsZ0JBQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFSyxNQUFNLENBQUUsS0FBa0IsRUFBRSxZQUEyQixFQUFFLEVBQUUsY0FBYyxFQUFFOztZQUMvRSxNQUFNLEtBQUssR0FBRyxNQUFNLGVBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdEQsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBRWhDLE1BQU0sRUFDSixNQUFNLEVBQ04sV0FBVyxFQUNYLFlBQVksRUFDWixTQUFTLEdBQ1YsR0FBRyxLQUFLLENBQUM7WUFDVixNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFBO1lBRXpFLE1BQU0sT0FBTyxHQUFRLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDckUsSUFBSSxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDM0IsT0FBTyxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7Z0JBQ3hDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO2dCQUN0QixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFD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