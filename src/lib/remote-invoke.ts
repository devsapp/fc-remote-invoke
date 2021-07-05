import _ from 'lodash';
import Client from './client';
import { IProperties, IEventPayload } from '../interface/entity';
import Event from './event';
import logger from '../common/logger';

export default class RemoteInvoke {
  fcClient: any;
  accountId: string;

  constructor(region: string, credentials) {
    this.accountId = credentials.AccountID;
    this.fcClient = Client.buildFcClient(region, credentials);
  }

  async invoke (props: IProperties, eventPayload: IEventPayload, { invocationType }) {
    const event = await Event.eventPriority(eventPayload);
    logger.debug(`event: ${event}`);

    const {
      region,
      serviceName,
      functionName,
      qualifier,
    } = props;
    const httpTriggers = await this.getHttpTrigger(serviceName, functionName)

    const payload: any = { event, serviceName, functionName, qualifier };
    if (_.isEmpty(httpTriggers)) {
      payload.invocationType = invocationType;
      payload.event = event;
      await this.eventInvoke(payload);
    } else {
      payload.region = region;
      try {
        payload.event = event ? JSON.parse(event) : {};
      } catch (ex) {
        logger.debug(ex);
        throw new Error('handler event error. Example: https://github.com/devsapp/fc-remote-invoke/blob/master/example/http.json');
      }
      
      await this.httpInvoke(payload);
    }
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

      const log = rs.headers['x-fc-log-result'];

      if (log) {
        logger.log('========= FC invoke Logs begin =========', 'yellow');
        const decodedLog = Buffer.from(log, 'base64');
        logger.log(decodedLog.toString());
        logger.log('========= FC invoke Logs end =========', 'yellow');

        logger.log('\nFC Invoke Result:', 'green');
        console.log(rs.data);
        console.log('\n');
      }
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

    logger.log(`https://${this.accountId}.${region}.fc.aliyuncs.com/2016-08-15/proxy/${serviceName}${q}/${functionName}/`);
    await this.request(event)
  }

  /**
   * @param event: { body, headers, method, queries, path }
   * path 组装后的路径 /proxy/serviceName/functionName/path ,
   */
  async request (event) {
    const { headers, queries, method, path: p, body } = this.handlerHttpParmase(event);

    let resp;
    try {
      const mt = method.toLocaleUpperCase();
      logger.debug(`method is ${mt}.`);
      logger.debug(`start invoke.`);
      if (mt === 'GET') {
        resp = await this.fcClient.get(p, queries, headers);
      } else if (mt === 'POST') {
        resp = await this.fcClient.post(p, body, headers, queries);
      } else if (mt === 'PUT') {
        resp = await this.fcClient.put(p, body, headers);
      } else if (mt === 'DELETE') {
        resp = await this.fcClient.request('DELETE', p, queries, null, headers);
        /* else if (method.toLocaleUpperCase() === 'PATCH') {
        resp = await this.fcClient.request('PATCH', p, queries, body, headers);
      } else if (method.toLocaleUpperCase() === 'HEAD') {
        resp = await this.fcClient.request('HEAD', p, queries, body, headers);
      } */
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

    if (resp) {
      const log = resp.headers['x-fc-log-result'];
      if (log) {
        logger.log('\n========= FC invoke Logs begin =========', 'yellow');
        const decodedLog = Buffer.from(log, 'base64')
        logger.log(decodedLog.toString())
        logger.log('========= FC invoke Logs end =========', 'yellow');
      }
      logger.log('\nFC Invoke Result:', 'green');
      console.log(resp.data);
      console.log('\n');
    }
  }

  handlerHttpParmase (event) {
    const { body = '', headers = {}, method = 'GET', queries = '', path: p = '' } = event;

    let postBody;
    if (body) {
      let buff = null;
      if (Buffer.isBuffer(body)) {
        buff = body;
        headers['content-type'] = 'application/octet-stream';
      } else if (typeof body === 'string') {
        buff = Buffer.from(body, 'utf8');
        headers['content-type'] = 'application/octet-stream';
      } else if (typeof body.pipe === 'function') {
        buff = body;
        headers['content-type'] = 'application/octet-stream';
      } else {
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
    }
  }
}