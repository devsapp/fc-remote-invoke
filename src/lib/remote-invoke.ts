import _ from 'lodash';
import got from 'got';
import { IProperties, IEventPayload } from '../interface/entity';
import Event from './event';
import logger from '../common/logger';

export default class RemoteInvoke {
  fcClient: any;
  accountId: string;

  constructor(fcClient: any, accountId: string) {
    this.fcClient = fcClient;
    this.accountId = accountId;
  }

  async invoke (props: IProperties, eventPayload: IEventPayload, { invocationType }) {
    const event = await Event.eventPriority(eventPayload);
    logger.debug(`event: ${event}`);

    const {
      region,
      serviceName,
      functionName,
      domainName,
      qualifier,
    } = props;
    if (domainName) {
      return this.requestDomain(domainName, event);
    }
    const httpTriggers = await this.getHttpTrigger(serviceName, functionName)

    const payload: any = { event, serviceName, functionName, qualifier };
    if (_.isEmpty(httpTriggers)) {
      payload.invocationType = invocationType;
      payload.event = event;
      await this.eventInvoke(payload);
    } else {
      payload.region = region;
      payload.event = this.getJsonEvent(event);
      
      await this.httpInvoke(payload);
    }
  }

  async requestDomain(url: string, event: string) {
    const payload = this.getJsonEvent(event);
    if (_.isEmpty(payload.headers)) {
      payload.headers = {};
    }
    payload.headers['X-Fc-Log-Type'] = 'Tail';
    
    const { body, headers } = await got(url, payload);
      
    this.showLog(headers['x-fc-log-result']);
    logger.log('\nFC Invoke Result:', 'green');
    console.log(body);
    logger.log('\n');
  }

  async getHttpTrigger(serviceName, functionName) {
    const { data } = await this.fcClient.listTriggers(serviceName, functionName);
    logger.debug(`get listTriggers: ${JSON.stringify(data)}`);

    if (_.isEmpty(data.triggers)) { return [] }

    const httpTrigger = data.triggers.filter(t => t.triggerType === 'http' || t.triggerType === 'https')
    if (_.isEmpty(httpTrigger)) { return [] }

    return httpTrigger;
  }

  async eventInvoke({
    serviceName,
    functionName,
    event,
    qualifier = 'LATEST',
    invocationType
  }) {

    if (invocationType === 'Sync') {
      const rs = await this.fcClient.invokeFunction(serviceName, functionName, event, {
        'X-Fc-Log-Type': 'Tail',
        'X-Fc-Invocation-Type': invocationType
      }, qualifier);

      this.showLog(rs.headers['x-fc-log-result']);
      logger.log('\nFC Invoke Result:', 'green');
      console.log(rs.data);
      console.log('\n');
    } else {
      const { headers } = await this.fcClient.invokeFunction(serviceName, functionName, event, {
        'X-Fc-Invocation-Type': invocationType
      }, qualifier);
      const rId = headers['x-fc-request-id'];

      logger.log(`\n${serviceName}/${functionName} async invoke success.\n${rId ? `request id: ${rId}\n` : ''}`, 'green');
    }
  }

  async httpInvoke({ region, serviceName, functionName, event, qualifier }) {
    const q = qualifier ? `.${qualifier}` : '';
    event.path = `/proxy/${serviceName}${q}/${functionName}/${event.path || ''}`;

    logger.log(`Request url: https://${this.accountId}.${region}.fc.aliyuncs.com/2016-08-15/proxy/${serviceName}${q}/${functionName}/`);
    await this.request(event)
  }

  /**
   * @param event: { body, headers, method, queries, path }
   * path 组装后的路径 /proxy/serviceName/functionName/path ,
   */
  async request(event) {
    const { headers = {}, queries, method = 'GET', path: p, body } = event;
    if (!headers['X-Fc-Log-Type']) {
      headers['X-Fc-Log-Type'] = 'Tail';
    }

    let resp;
    try {
      const mt = method.toLocaleUpperCase();
      logger.debug(`method is ${mt}.`);
      logger.debug(`start invoke.`);
      if (mt === 'GET') {
        resp = await this.fcClient.costom_request('GET', p, queries, null, headers);
      } else if (mt === 'POST') {
        resp = await this.fcClient.costom_request('POST', p, queries, body, headers);
      } else if (mt === 'PUT') {
        resp = await this.fcClient.costom_request('PUT', p, null, body, headers);
      } else if (mt === 'DELETE') {
        resp = await this.fcClient.costom_request('DELETE', p, queries, null, headers);
      } else if (method.toLocaleUpperCase() === 'PATCH') {
        resp = await this.fcClient.costom_request('PATCH', p, queries, body, headers);
      } else if (method.toLocaleUpperCase() === 'HEAD') {
        resp = await this.fcClient.costom_request('HEAD', p, queries, body, headers);
      } else {
        logger.error(`Does not support ${method} requests temporarily.`);
      }
    } catch (e) {
      logger.debug(e);
      if (e.message === 'Unexpected token r in JSON at position 0' && e.stack.includes('/fc2/lib/client.js') && e.stack.includes('at Client.request')) {
        throw new Error('The body in http responss is not in json format, but the content-type in response header is application/json. We recommend that you make the format of the response body be consistent with the content-type in response header.');
      }
      throw e;
    }
    logger.debug(`end invoke.`);

    if (resp?.err) {
      this.showLog(resp.headers['x-fc-log-result']);
      logger.log(`\nFC Invoke Result[Code: ${resp.code}]:`, 'red');
      console.log(resp.data);
      console.log('\n');
    } else {
      if (resp) {
        this.showLog(resp.headers['x-fc-log-result']);

        logger.log(`\nFC Invoke Result[Code: ${resp.code}]:`, 'green');
        console.log(resp.data);
        console.log('\n');
      }
    }
  }

  private showLog(log) {
    if (log) {
      logger.log('========= FC invoke Logs begin =========', 'yellow');
      const decodedLog = Buffer.from(log, 'base64');
      logger.log(decodedLog.toString());
      logger.log('========= FC invoke Logs end =========', 'yellow');
    }
  }

  private getJsonEvent(event: string) {
    try {
      return event ? JSON.parse(event) : {};
    } catch (ex) {
      logger.debug(ex);
      throw new Error('handler event error. Example: https://github.com/devsapp/fc-remote-invoke/blob/master/example/http.json');
    }
  }
}