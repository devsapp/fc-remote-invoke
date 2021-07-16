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
const client_1 = __importDefault(require("./client"));
const event_1 = __importDefault(require("./event"));
const logger_1 = __importDefault(require("../common/logger"));
class RemoteInvoke {
    constructor(region, credentials, domainName) {
        if (!domainName) {
            this.accountId = credentials.AccountID;
            this.fcClient = client_1.default.buildFcClient(region, credentials);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlLWludm9rZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcmVtb3RlLWludm9rZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLG9EQUF1QjtBQUN2Qiw4Q0FBc0I7QUFDdEIsc0RBQThCO0FBRTlCLG9EQUE0QjtBQUM1Qiw4REFBc0M7QUFFdEMsTUFBcUIsWUFBWTtJQUkvQixZQUFZLE1BQWMsRUFBRSxXQUFXLEVBQUUsVUFBVTtRQUNqRCxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2YsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxRQUFRLEdBQUcsZ0JBQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQzNEO0lBQ0gsQ0FBQztJQUVLLE1BQU0sQ0FBRSxLQUFrQixFQUFFLFlBQTJCLEVBQUUsRUFBRSxjQUFjLEVBQUU7O1lBQy9FLE1BQU0sS0FBSyxHQUFHLE1BQU0sZUFBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN0RCxnQkFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLEtBQUssRUFBRSxDQUFDLENBQUM7WUFFaEMsTUFBTSxFQUNKLE1BQU0sRUFDTixXQUFXLEVBQ1gsWUFBWSxFQUNaLFVBQVUsRUFDVixTQUFTLEdBQ1YsR0FBRyxLQUFLLENBQUM7WUFDVixJQUFJLFVBQVUsRUFBRTtnQkFDZCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzlDO1lBQ0QsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQTtZQUV6RSxNQUFNLE9BQU8sR0FBUSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQ3JFLElBQUksZ0JBQUMs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