import FC from '@alicloud/fc2';
import * as core from '@serverless-devs/core';
import { ICredentials } from '../interface/entity';

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