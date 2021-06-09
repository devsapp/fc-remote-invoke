import _ from 'lodash';
import * as core from '@serverless-devs/core';
import logger from './common/logger';
import HELP from './common/help';
import { InputProps, ICredentials, isProperties, IProperties } from './interface/entity';
import RemoteInvoke from './lib/remote-invoke';

export default class FcRemoteInvoke {
  async report(componentName: string, command: string, accountID: string): Promise<void> {
    core.reportComponent(componentName, {
      command,
      uid: accountID,
    });
  }

  async handlerInputs(inputs: InputProps): Promise<any> {
    const credentials: ICredentials = await core.getCredential(inputs?.project?.access);

    // 去除 args 的行首以及行尾的空格
    const args: string = (inputs?.args || '').replace(/(^\s*)|(\s*$)/g, '');
    logger.debug(`input args: ${args}`);

    const parsedArgs: {[key: string]: any} = core.commandParse({ args }, {
      boolean: ['help', 'event-stdin'],
      string: ['invocation-type', 'event', 'event-file', 'region', 'service-name', 'function-name', 'qualifier'],
      alias: {
        'help': 'h',
        'event': 'e',
        'invocation-type': 't',
        'event-file': 'f',
        'event-stdin': 's',
      }
    });

    const argsData: any = parsedArgs?.data || {};
    logger.debug(`command parse: ${JSON.stringify(argsData)}`);
    if (argsData.help) {
      return {
        credentials,
        isHelp: true,
      };
    }

    const {
      e: event,
      f: eventFile,
      s: eventStdin,
      t: invocationType = 'sync',
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

    logger.debug(`input props: ${JSON.stringify(inputs.props)}`);

    let props: IProperties = {
      region: argsData.region,
      serviceName: argsData['service-name'],
      functionName: argsData['function-name'],
    };
    logger.debug(`input args props: ${JSON.stringify(props)}`);

    if (!isProperties(props)) {
      props = inputs.props;
    }
    logger.debug(`props: ${JSON.stringify(props)}`);

    if (!isProperties(props)) {
      throw new Error('region/serviceName(service-name)/functionName(function-name) can not be empty.');
    }

    props.qualifier = argsData.qualifier || inputs.props?.qualifier;

    return {
      props,
      credentials,
      eventPayload,
      isHelp: false,
      invocationType: _.upperFirst(invocationType),
    };
  }

  /**
   * event 函数本地调试
   * @param inputs
   * @returns
   */
  public async invoke(inputs: InputProps): Promise<any> {
    const {
      props,
      eventPayload,
      credentials,
      isHelp,
      invocationType,
    } = await this.handlerInputs(inputs);
    await this.report('fc-remote-invoke', 'invoke', credentials?.AccountID);

    if (isHelp) {
      console.log('??');
      core.help(HELP);
      return;
    }

    const remoteInvoke = new RemoteInvoke(props.region, credentials);
    await remoteInvoke.invoke(props, eventPayload, { invocationType });
  }
}
