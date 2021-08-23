import FC from '@alicloud/fc2';
import querystring from 'querystring';
import kitx from 'kitx';
import httpx from 'httpx';
import * as core from '@serverless-devs/core';
import { ICredentials } from '../interface/entity';

FC.prototype.costom_request = async function (method, path, query, body, headers = {}, opts = {}) {
  var url = `${this.endpoint}/${this.version}${path}`;
  if (query && Object.keys(query).length > 0) {
    url = `${url}?${querystring.stringify(query)}`;
  }

  headers = Object.assign(this.buildHeaders(), this.headers, headers);
  var postBody;
  if (body) {
    var buff = null;
    if (Buffer.isBuffer(body)) {
      buff = body;
      headers['content-type'] = 'application/octet-stream';
    } else if (typeof body === 'string') {
      buff = new Buffer(body, 'utf8');
      headers['content-type'] = 'application/octet-stream';
    } else if ('function' === typeof body.pipe) {
      buff = body;
      headers['content-type'] = 'application/octet-stream';
    } else {
      buff = new Buffer(JSON.stringify(body), 'utf8');
      headers['content-type'] = 'application/json';
    }

    if ('function' !== typeof body.pipe) {
      const digest = kitx.md5(buff, 'hex');
      const md5 = new Buffer(digest, 'utf8').toString('base64');

      headers['content-length'] = buff.length;
      headers['content-md5'] = md5;
    }
    postBody = buff;
  }

  var queriesToSign = null;
  if (path.startsWith('/proxy/')) {
    queriesToSign = query || {};
  }
  var signature = FC.getSignature(this.accessKeyID, this.accessKeySecret, method, `/${this.version}${path}`, headers, queriesToSign);
  headers['authorization'] = signature;

  const response = await httpx.request(url, {
    method,
    timeout: this.timeout,
    headers,
    data: postBody
  });

  var responseBody;
  if (!opts['rawBuf'] || response.headers['x-fc-error-type']) {
    responseBody = await httpx.read(response, 'utf8');
  } else {
    // @ts-ignore: .
    responseBody = await httpx.read(response);
  }

  const contentType = response.headers['content-type'] || '';
  if (contentType.startsWith('application/json')) {
    try {
      responseBody = JSON.parse(responseBody);
    } catch (ex) {}
  }

  let err;
  if (response.statusCode < 200 || response.statusCode >= 300) {
    const code = response.statusCode;
    const requestid = response.headers['x-fc-request-id'];
    var errMsg;
    if (responseBody.ErrorMessage) {
      errMsg = responseBody.ErrorMessage;
    } else {
      errMsg = responseBody.errorMessage;
    }
    err = new Error(`${method} ${path} failed with ${code}. requestid: ${requestid}, message: ${errMsg}.`);
    err.name = `FC${responseBody.ErrorCode}Error`;
    // @ts-ignore: .
    err.code = responseBody.ErrorCode;
  }

  return {
    err,
    code: response.statusCode,
    'headers': response.headers,
    'data': responseBody,
  };
}

export default class Client {
  static async buildFcClient(region: string, credentials: ICredentials) {
    return new FC(credentials.AccountID, {
      accessKeyID: credentials.AccessKeyID,
      accessKeySecret: credentials.AccessKeySecret,
      securityToken: credentials.SecurityToken,
      region,
      endpoint: await this.getFcEndpoint(),
      timeout: 6000000,
    })
  }

  private static async getFcEndpoint(): Promise<string | undefined> {
    const fcDefault = await core.loadComponent('devsapp/fc-default');
    const fcEndpoint: string = await fcDefault.get({ args: 'fc-endpoint' });
    if (!fcEndpoint) { return undefined; }
    const enableFcEndpoint: any = await fcDefault.get({ args: 'enable-fc-endpoint' });
    return (enableFcEndpoint === true || enableFcEndpoint === 'true') ? fcEndpoint : undefined;
  }
}