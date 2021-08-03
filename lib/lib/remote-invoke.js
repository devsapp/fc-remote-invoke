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
const got_1 = __importDefault(require("got"));
const event_1 = __importDefault(require("./event"));
const logger_1 = __importDefault(require("../common/logger"));
class RemoteInvoke {
    constructor(fcClient, accountId) {
        this.fcClient = fcClient;
        this.accountId = accountId;
    }
    invoke(props, eventPayload, { invocationType }) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield event_1.default.eventPriority(eventPayload);
            logger_1.default.debug(`event: ${event}`);
            const { region, serviceName, functionName, domainName, qualifier, } = props;
            if (domainName) {
                return this.requestDomain(domainName, event);
            }
            const httpTriggers = yield this.getHttpTrigger(serviceName, functionName);
            const payload = { event, serviceName, functionName, qualifier };
            if (lodash_1.default.isEmpty(httpTriggers)) {
                payload.invocationType = invocationType;
                payload.event = event;
                yield this.eventInvoke(payload);
            }
            else {
                payload.region = region;
                payload.event = this.getJsonEvent(event);
                yield this.httpInvoke(payload);
            }
        });
    }
    requestDomain(url, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = this.getJsonEvent(event);
            if (lodash_1.default.isEmpty(payload.headers)) {
                payload.headers = {};
            }
            payload.headers['X-Fc-Log-Type'] = 'Tail';
            const { body, headers } = yield got_1.default(url, payload);
            this.showLog(headers['x-fc-log-result']);
            logger_1.default.log('\nFC Invoke Result:', 'green');
            console.log(body);
            logger_1.default.log('\n');
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
                this.showLog(rs.headers['x-fc-log-result']);
                logger_1.default.log('\nFC Invoke Result:', 'green');
                console.log(rs.data);
                console.log('\n');
            }
            else {
                const { headers } = yield this.fcClient.invokeFunction(serviceName, functionName, event, {
                    'X-Fc-Invocation-Type': invocationType
                }, qualifier);
                const rId = headers['x-fc-request-id'];
                logger_1.default.log(`\n${serviceName}/${functionName} async invoke success.\n${rId ? `request id: ${rId}\n` : ''}`, 'green');
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
                    logger_1.default.error(`Does not support ${method} requests temporarily.`);
                }
            }
            catch (e) {
                logger_1.default.debug(e);
                if (e.message === 'Unexpected token r in JSON at position 0' && e.stack.includes('/fc2/lib/client.js') && e.stack.includes('at Client.request')) {
                    throw new Error('The body in http responss is not in json format, but the content-type in response header is application/json. We recommend that you make the format of the response body be consistent with the content-type in response header.');
                }
                throw e;
            }
            logger_1.default.debug(`end invoke.`);
            if (resp) {
                this.showLog(resp.headers['x-fc-log-result']);
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
    showLog(log) {
        if (log) {
            logger_1.default.log('========= FC invoke Logs begin =========', 'yellow');
            const decodedLog = Buffer.from(log, 'base64');
            logger_1.default.log(decodedLog.toString());
            logger_1.default.log('========= FC invoke Logs end =========', 'yellow');
        }
    }
    getJsonEvent(event) {
        try {
            return event ? JSON.parse(event) : {};
        }
        catch (ex) {
            logger_1.default.debug(ex);
            throw new Error('handler event error. Example: https://github.com/devsapp/fc-remote-invoke/blob/master/example/http.json');
        }
    }
}
exports.default = RemoteInvoke;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlLWludm9rZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcmVtb3RlLWludm9rZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLG9EQUF1QjtBQUN2Qiw4Q0FBc0I7QUFFdEIsb0RBQTRCO0FBQzVCLDhEQUFzQztBQUV0QyxNQUFxQixZQUFZO0lBSS9CLFlBQVksUUFBYSxFQUFFLFNBQWlCO1FBQzFDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzdCLENBQUM7SUFFSyxNQUFNLENBQUUsS0FBa0IsRUFBRSxZQUEyQixFQUFFLEVBQUUsY0FBYyxFQUFFOztZQUMvRSxNQUFNLEtBQUssR0FBRyxNQUFNLGVBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdEQsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBRWhDLE1BQU0sRUFDSixNQUFNLEVBQ04sV0FBVyxFQUNYLFlBQVksRUFDWixVQUFVLEVBQ1YsU0FBUyxHQUNWLEdBQUcsS0FBSyxDQUFDO1lBQ1YsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUM5QztZQUNELE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUE7WUFFekUsTUFBTSxPQUFPLEdBQVEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUNyRSxJQUFJLGdCQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUMzQixPQUFPLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztnQkFDeEMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFL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