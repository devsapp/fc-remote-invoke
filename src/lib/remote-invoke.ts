import { spinner, lodash as _, CatchableError, loadComponent } from '@serverless-devs/core';
import { IProperties } from '../interface/entity';
import logger from '../common/logger';
import { getJsonEvent, getInstanceId, showLog, requestDomain } from './utils';

export default class RemoteInvoke {
  fcCore: any;
  fcClient: any;
  accountId: string;
  sdkVersion?: string;
  private credentials: any;

  constructor(credPayload) {
    this.sdkVersion = credPayload.sdkVersion;
    this.credentials = credPayload.credentials;
    this.accountId = credPayload.credentials.AccountID;
  }

  async init(access, timeout, region) {
    this.fcCore = await loadComponent('devsapp/fc-core');
    this.fcClient = await this.fcCore.makeFcClient({
      region,
      access,
      timeout,
      credentials: this.credentials,
    });
  }

  async invoke(props: IProperties, event, parames) {
    const { serviceName, functionName, qualifier } = props;
    const httpTrigger = await this.getHttpTrigger(serviceName, functionName, qualifier); // 一定是0个或者1个元素
    logger.debug(`invoke http res: ${JSON.stringify(httpTrigger)}`);

    const payload: any = { event, serviceName, functionName, qualifier };
    if (_.isEmpty(httpTrigger)) {
      payload.event = event;
      return await this.eventInvoke(payload, parames);
    }

    const jsonEvent = getJsonEvent(event);

    const urlInternet = _.get(httpTrigger, '0.urlInternet');
    // 调用 2016-08-15 版本的使用方式
    if (this.sdkVersion === '2016-08-15' || _.isEmpty(urlInternet)) {
      logger.debug('invoke version 2016-08-15');
      payload.event = jsonEvent;
      return await this.httpInvoke(payload, parames);
    }

    const customPath = jsonEvent.path ? jsonEvent.path : '/';
    const url = `${urlInternet}${customPath}`;
    delete jsonEvent.path;

    const headers = Object.assign(this.fcClient.buildHeaders(), this.fcClient.headers, jsonEvent?.headers || {});
    if (!_.get(headers, 'X-Fc-Stateful-Async-Invocation-Id')) {
      _.set(headers, 'X-Fc-Stateful-Async-Invocation-Id', parames.statefulAsyncInvocationId || '');
    }
    _.set(headers, 'X-Fc-Invocation-Type', parames.invocationType || 'sync');
    delete headers.host; // 携带 host 会导致请求失败

    const isAsync = _.get(payload, 'headers[X-Fc-Invocation-Type]', '').toLocaleLowerCase() === 'async';
    _.set(payload, 'headers[X-Fc-Log-Type]', isAsync ? 'None' : 'Tail');

    if (_.get(httpTrigger, '0.triggerConfig.authType')?.toLocaleLowerCase() !== 'anonymous') {
      logger.debug('invoke http function');
      this.getSignature(headers, jsonEvent.method, customPath);
    }

    return await requestDomain(url, _.mergeWith(jsonEvent, { headers }));
  }

  async getHttpTrigger(serviceName, functionName, qualifier) {
    const { data } = await this.fcClient.listTriggers(serviceName, functionName);
    logger.debug(`get listTriggers: ${JSON.stringify(data)}`);

    if (_.isEmpty(data.triggers)) {
      return [];
    }

    const httpTrigger = data.triggers.filter((t) => t.triggerType === 'http' || t.triggerType === 'https');
    if (_.isEmpty(httpTrigger)) {
      return [];
    }

    let assignQualifierHttpTrigger;
    if (qualifier && qualifier.toLocaleLowerCase() !== 'latest') {
      assignQualifierHttpTrigger = httpTrigger.filter((h) => qualifier === h.qualifier);
    } else {
      assignQualifierHttpTrigger = httpTrigger.filter((h) => !h.qualifier || h.qualifier?.toLocaleLowerCase() === 'latest');
    }

    if (_.isEmpty(assignQualifierHttpTrigger)) {
      logger.warn(`Your function has an HTTP trigger, but no trigger is configured for the ${qualifier || 'LATEST'}.`);
      logger.warn('Try calling with event mode.');
      return [];
    }

    return assignQualifierHttpTrigger;
  }

  async eventInvoke({ serviceName, functionName, event, qualifier = 'LATEST' }, { invocationType, statefulAsyncInvocationId }) {
    if (invocationType === 'Sync') {
      const invokeVm = spinner(`invoke function: ${serviceName} / ${functionName}\n`);
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

      showLog(rs.headers['x-fc-log-result'], getInstanceId(rs.headers));
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

  async httpInvoke({ serviceName, functionName, event, qualifier }, { invocationType, statefulAsyncInvocationId }) {
    const q = qualifier ? `.${qualifier}` : '';
    const p = `/proxy/${serviceName}${q}/${functionName}/${event.path || ''}`;

    logger.log(`\nRequest url: ${this.fcClient.endpoint}/2016-08-15/proxy/${serviceName}${q}/${functionName}/\n`);

    const { headers = {}, queries, method = 'GET', body } = event;
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
    logger.log('');

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
        throw new CatchableError(
          'The body in http responss is not in json format, but the content-type in response header is application/json. We recommend that you make the format of the response body be consistent with the content-type in response header.',
        );
      }
      throw e;
    }
    logger.debug(`end invoke.`);

    if (resp?.err) {
      showLog(resp.headers['x-fc-log-result'], getInstanceId(resp.headers));
      logger.log(`\nFC Invoke Result[Code: ${resp.code}]:`, 'red');
      console.log(resp.data);
      console.log('\n');
    } else {
      if (resp) {
        showLog(resp.headers['x-fc-log-result'], getInstanceId(resp.headers));

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

  private getSignature(headers, method = 'GET', path) {
    const { AccessKeyID, AccessKeySecret } = this.credentials;

    const getSignature = _.get(this.fcCore, 'alicloudFc2.getSignature') || _.get(this.fcCore, 'alicloudFc2.default.getSignature');
    headers['authorization'] = getSignature(AccessKeyID, AccessKeySecret, method, path, headers, {});
  }
}
