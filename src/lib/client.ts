import FC from '@alicloud/fc2';
import { ICredentials } from '../interface/entity';

export default class Client {
  static buildFcClient(region: string, credentials: ICredentials) {
    return new FC(credentials.AccountID, {
      accessKeyID: credentials.AccessKeyID,
      accessKeySecret: credentials.AccessKeySecret,
      securityToken: credentials.SecurityToken,
      region,
      timeout: 6000000,
    })
  }
}