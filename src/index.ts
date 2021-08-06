import _ from 'lodash';
import * as core from '@serverless-devs/core';
import logger from './common/logger';
import HELP from './common/help';
import { InputProps, isProperties, IProperties } from './interface/entity';
// import StdoutFormatter from './common/stdout-formatter';
import RemoteInvoke from './lib/remote-invoke';
import Client from './lib/client';

export default class FcRemoteInvoke {
  /**
   * event 函数本地调试
   * @param inputs
   * @returns
   */
  async invoke(inputs: InputProps): Promise<any> {
    const {
      props,
      eventPayload,
      credentials,
      isHelp,
      invocationType,
    } = await this.handlerInputs(inputs);
    await this.report('fc-remote-invoke', 'invoke', credentials?.AccountID);

    if (isHelp) {
      core.help(HELP);
      return;
    }

    let fcClient;
    if (!props.domainName) {
      fcClient = await Client.buildFcClient(props.region, credentials);
    }
    const remoteInvoke = new RemoteInvoke(fcClient, credentials.AccountID);
    await remoteInvoke.invoke(props, eventPayload, { invocationType });
  }

  private async report(componentName: string, command: string, accountID: string): Promise<void> {
    core.reportComponent(componentName, {
      command,
      uid: accountID,
    });
  }

  private async handlerInputs(inputs: InputProps): Promise<any> {
    // 去除 args 的行首以及行尾的空格
    const args: string = (inputs?.args || '').replace(/(^\s*)|(\s*$)/g, '');
    logger.debug(`input args: ${args}`);

    const parsedArgs: {[key: string]: any} = core.commandParse({ ...inputs, args }, {
      boolean: ['help', 'event-stdin'],
      string: ['invocation-type', 'event', 'event-file', 'region', 'domain-name','service-name', 'function-name', 'qualifier'],
      alias: {
        'help': 'h',
        'event': 'e',
        'event-file': 'f',
      }
    });

    const argsData: any = parsedArgs?.data || {};
    logger.debug(`command parse: ${JSON.stringify(argsData)}`);
    if (argsData.help) {
      return {
        credentials: inputs.credentials,
        isHelp: true,
      };
    }

    const {
      e: event,
      f: eventFile,
      'event-stdin': eventStdin,
      'invocation-type': invocationType = 'sync',
      'domain-name': domainName,
    } = argsData;
    const eventPayload = { event, eventFile, eventStdin };
    // @ts-ignore: 判断三个值有几个真
    const eventFlag = !!event + !!eventFile + !!eventStdin;

    if (eventFlag > 1) {
      throw new Error('event | event-file | event-stdin must choose one.');
    } else if (eventFlag === 0) {
      eventPayload.event = '';
    }

    if (!['sync', 'async'].includes(invocationType)) {
      throw new Error('invocation-type enum value sync, async.');
    }
    if (!domainName && !inputs?.credentials) {
      inputs.credentials = await core.getCredential(inputs?.project?.access);
    }

    logger.debug(`input props: ${JSON.stringify(inputs.props)}`);

    const props: IProperties = {
      region: argsData.region || inputs.props?.region,
      serviceName: argsData['service-name'] || inputs.props?.serviceName,
      functionName: argsData['function-name'] || inputs.props?.functionName,
      domainName: domainName || inputs.props?.domainName,
      qualifier: argsData.qualifier || inputs.props?.qualifier,
    };
    logger.debug(`input args props: ${JSON.stringify(props)}`);
    if (!isProperties(props)) {
      throw new Error('region/serviceName(service-name)/functionName(function-name) can not be empty.');
    }

    return {
      props,
      credentials: inputs.credentials,
      eventPayload,
      isHelp: false,
      invocationType: _.upperFirst(invocationType),
    };
  }

}
