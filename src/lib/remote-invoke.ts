import _ from 'lodash';
import got from 'got';
import { spinner } from '@serverless-devs/core';
import { IProperties, IEventPayload } from '../interface/entity';
import Event from './event';
import logger from '../common/logger';

const getInstanceId = (headers) => _.get(headers, 'x-fc-instance-id');

export default class RemoteInvoke {
  fcClient: any;
  accountId: string;

  constructor(fcClient: any, accountId: string) {
    this.fcClient = fcClient;
    this.accountId = accountId;
  }

  async invoke(props: IProperties, eventPayload: IEventPayload, parames) {
    const event = await Event.eventPriority(eventPayload);
    logger.debug(`event: ${event}`);

    const { region, serviceName, functionName, qualifier } = props;
    const httpTriggers = await this.getHttpTrigger(serviceName, functionName);

    const payload: any = { event, serviceName, functionName, qualifier };
    if (_.isEmpty(httpTriggers)) {
      payload.event = event;
      await this.eventInvoke(payload, parames);
    } else {
      payload.region = region;
      payload.event = RemoteInvoke.getJsonEvent(event);

      await this.httpInvoke(payload, parames);
    }
  }

  async getHttpTrigger(serviceName, functionName) {
    const { data } = await this.fcClient.listTriggers(serviceName, functionName);
    logger.debug(`get listTriggers: ${JSON.stringify(data)}`);

    if (_.isEmpty(data.triggers)) {
      return [];
    }

    const httpTrigger = data.triggers.filter((t) => t.triggerType === 'http' || t.triggerType === 'https');
    if (_.isEmpty(httpTrigger)) {
      return [];
    }

    return httpTrigger;
  }

  async eventInvoke({ serviceName, functionName, event, qualifier = 'LATEST' }, { invocationType, statefulAsyncInvocationId }) {
    if (invocationType === 'Sync') {
      const invokeVm = spinner(`invoke function: ${serviceName} / ${functionName}`);
      const rs = await this.fcClient.invokeFunction(
        serviceName,
        functionName,
        event,
        {
          'X-Fc-Log-Type': 'Tail',
          'X-Fc-Invocation-Code-Version': 'Latest',
          'X-Fc-Invocation-Type': invocationType,
        },
        qualifier,
      );
      invokeVm.stop();

      RemoteInvoke.showLog(rs.headers['x-fc-log-result'], getInstanceId(rs.headers));
      logger.log('\nFC Invoke Result:', 'green');
      console.log(rs.data);
      console.log('\n');
    } else {
      logger.debug(`Stateful async invocation id: ${statefulAsyncInvocationId}`);
      const invokeVm = spinner(`invoke function: ${serviceName} / ${functionName}`);
      const { headers } = await this.fcClient.invokeFunction(
        serviceName,
        functionName,
        event,
        {
          'X-Fc-Invocation-Code-Version': 'Latest',
          'X-Fc-Invocation-Type': invocationType,
          'X-Fc-Stateful-Async-Invocation-Id': statefulAsyncInvocationId || '',
        },
        qualifier,
      );
      invokeVm.stop();
      const rId = headers['x-fc-request-id'];

      logger.log(`\n${serviceName}/${functionName} async invoke success.\n${rId ? `request id: ${rId}\n` : ''}`, 'green');
    }
  }

  async httpInvoke({ region, serviceName, functionName, event, qualifier }, parames) {
    const q = qualifier ? `.${qualifier}` : '';
    event.path = `/proxy/${serviceName}${q}/${functionName}/${event.path || ''}`;

    logger.log(`\nRequest url: ${this.fcClient.endpoint}/2016-08-15/proxy/${serviceName}${q}/${functionName}/\n`);
    await this.request(event, parames);
  }

  /**
   * @param event: { body, headers, method, queries, path }
   * path 组装后的路径 /proxy/serviceName/functionName/path ,
   */
  async request(event, { invocationType, statefulAsyncInvocationId }) {
    const { headers = {}, queries, method = 'GET', path: p, body } = event;
    if (statefulAsyncInvocationId) {
      _.set(headers, 'X-Fc-Stateful-Async-Invocation-Id', statefulAsyncInvocationId);
    } else if (!headers['X-Fc-Stateful-Async-Invocation-Id']) {
      _.set(headers, 'X-Fc-Stateful-Async-Invocation-Id', '');
    }
    if (invocationType) {
      _.set(headers, 'X-Fc-Invocation-Type', invocationType);
    }
    const isAsync = _.get(headers, 'X-Fc-Invocation-Type', '').toLocaleLowerCase() === 'async';
    if (!headers['X-Fc-Log-Type']) {
      headers['X-Fc-Log-Type'] = isAsync ? 'None' : 'Tail';
    }
    logger.debug(`headers: ${JSON.stringify(headers)}`);

    let resp;
    const invokeVm = spinner(`invoke path: ${p}`);
    try {
      const mt = method.toLocaleUpperCase();
      logger.debug(`method is ${mt}.`);
      logger.debug(`start invoke.`);
      if (mt === 'GET') {
        resp = await this.fcClient.custom_request('GET', p, queries, null, headers);
      } else if (mt === 'POST') {
        resp = await this.fcClient.custom_request('POST', p, queries, body, headers);
      } else if (mt === 'PUT') {
        resp = await this.fcClient.custom_request('PUT', p, null, body, headers);
      } else if (mt === 'DELETE') {
        resp = await this.fcClient.custom_request('DELETE', p, queries, null, headers);
      } else if (method.toLocaleUpperCase() === 'PATCH') {
        resp = await this.fcClient.custom_request('PATCH', p, queries, body, headers);
      } else if (method.toLocaleUpperCase() === 'HEAD') {
        resp = await this.fcClient.custom_request('HEAD', p, queries, body, headers);
      } else {
        invokeVm.stop();
        logger.error(`Does not support ${method} requests temporarily.`);
      }
      invokeVm.stop();
    } catch (e) {
      invokeVm.stop();
      logger.debug(e);
      if (
        e.message === 'Unexpected token r in JSON at position 0' &&
        e.stack.includes('/fc2/lib/client.js') &&
        e.stack.includes('at Client.request')
      ) {
        throw new Error(
          'The body in http responss is not in json format, but the content-type in response header is application/json. We recommend that you make the format of the response body be consistent with the content-type in response header.',
        );
      }
      throw e;
    }
    logger.debug(`end invoke.`);

    if (resp?.err) {
      RemoteInvoke.showLog(resp.headers['x-fc-log-result'], getInstanceId(resp.headers));
      logger.log(`\nFC Invoke Result[Code: ${resp.code}]:`, 'red');
      console.log(resp.data);
      console.log('\n');
    } else {
      if (resp) {
        RemoteInvoke.showLog(resp.headers['x-fc-log-result'], getInstanceId(resp.headers));

        if (isAsync) {
          logger.log(`\nFC Invoke Result:`, 'green');
          logger.log(`Code: ${resp.code}`, 'green');
          logger.log(`RequestId: ${_.get(resp, 'headers["x-fc-request-id"]', '')}\n`, 'green');
        } else {
          logger.log(`\nFC Invoke Result[Code: ${resp.code}]:`, 'green');
          console.log(resp.data);
          console.log('\n');
        }
      }
    }
  }

  static async requestDomain(url: string, eventPayload: IEventPayload) {
    const event = await Event.eventPriority(eventPayload);
    logger.debug(`event: ${event}`);
    const payload = RemoteInvoke.getJsonEvent(event);
    if (_.isEmpty(payload.headers)) {
      payload.headers = {};
    }
    payload.headers['X-Fc-Log-Type'] = 'Tail';

    const { body, headers } = await got(url, payload);

    this.showLog(headers['x-fc-log-result'], getInstanceId(headers));
    logger.log('\nFC Invoke Result:', 'green');
    console.log(body);
    logger.log('\n');
  }

  static showLog(log, instanceId) {
    if (log) {
      logger.log('========= FC invoke Logs begin =========', 'yellow');
      const decodedLog = Buffer.from(log, 'base64');
      logger.log(decodedLog.toString());
      logger.log('========= FC invoke Logs end =========', 'yellow');
    }
    if (instanceId) {
      logger.log(`\n\x1B[32mFC Invoke instanceId:\x1B[0m ${instanceId}`);
    }
  }

  static getJsonEvent(event: string) {
    try {
      return event ? JSON.parse(event) : {};
    } catch (ex) {
      logger.debug(ex);
      throw new Error('handler event error. Example: https://github.com/devsapp/fc-remote-invoke/blob/master/example/http.json');
    }
  }
}
