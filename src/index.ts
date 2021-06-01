import logger from './common/logger';
import _ from 'lodash';
import * as core from '@serverless-devs/core';

export default class FcRemoteInvoke {
  async report(componentName: string, command: string, accountID?: string, access?: string): Promise<void> {
    let uid: string = accountID;
    if (_.isEmpty(accountID)) {
      const credentials = await core.getCredential(access);
      uid = credentials.AccountID;
    }

    core.reportComponent(componentName, {
      command,
      uid,
    });
  }

  async handlerInputs(inputs): Promise<any> {
    const project = inputs?.project;
    const properties = inputs?.props;
    const access: string = project?.access;
    const appName: string = inputs?.appName;
    const credentials = await core.getCredential(access);
    // 去除 args 的行首以及行尾的空格
    const args: string = inputs?.args.replace(/(^\s*)|(\s*$)/g, '');
    const curPath: any = inputs?.path;
    const projectName: string = project?.projectName;
    const { region } = properties;

    if (args?.includes('help')) {
      return {
        region,
        credentials,
        curPath,
        args,
        access,
      };
    }

    
    return {};
  }

  /**
   * event 函数本地调试
   * @param inputs
   * @returns
   */
  public async invoke(inputs): Promise<any> {
    const {
      args,
      credentials
    } = await this.handlerInputs(inputs);
    await this.report('fc-remote-invoke', 'invoke', credentials?.AccountID);
    const parsedArgs: {[key: string]: any} = core.commandParse({ args }, {
      boolean: ['debug'],
      alias: { 'help': 'h',
                'config': 'c',
                'mode': 'm',
                'event': 'e',
                'event-file': 'f',
                'event-stdin': 's',
                'debug-port': 'd'
              }
      });
    const argsData: any = parsedArgs?.data || {};
    if (argsData.help) {
      // TODO: help info
      return;
    }

    return {};
  }
}
