import { CatchableError, getCredential, lodash as _, help, commandParse } from '@serverless-devs/core';
import logger from './common/logger';
import HELP from './common/help';
import { InputProps, isProperties, IProperties } from './interface/entity';
import RemoteInvoke from './lib/remote-invoke';
import Event from './lib/event';
import { getJsonEvent, requestDomain } from './lib/utils';

export default class FcRemoteInvoke {
  /**
   * event 函数本地调试
   * @param inputs
   * @returns
   */
  async invoke(inputs: InputProps): Promise<any> {
    const { props, credPayload, event, isHelp, parames, timeout } = await this.handlerInputs(inputs);

    if (isHelp) {
      help(HELP);
      return;
    }

    if (props.domainName) {
      const payload = getJsonEvent(event);
      await requestDomain(props.domainName, payload);
      return;
    }

    const remoteInvoke = new RemoteInvoke(credPayload);
    await remoteInvoke.init(inputs.project?.access, timeout, props.region);
    await remoteInvoke.invoke(props, event, parames);
  }

  private async handlerInputs(inputs: InputProps): Promise<any> {
    logger.debug(`input props: ${JSON.stringify(inputs.props)}`);
    const opts = {
      boolean: ['help', 'event-stdin'],
      number: ['timeout'],
      string: [
        'invocation-type',
        'event',
        'event-file',
        'qualifier',
        'stateful-async-invocation-id',
        'region',
        'domain-name',
        'service-name',
        'function-name',
        'sdk-version',
      ],
      alias: {
        help: 'h',
        'event-file': 'f',
        'event-stdin': 's',
      },
    };
    const argsData: { [key: string]: any } = commandParse(inputs, opts)?.data || {};
    logger.debug(`command parse: ${JSON.stringify(argsData)}`);
    if (argsData.help) {
      return {
        credentials: inputs.credentials,
        isHelp: true,
      };
    }

    const {
      event = '',
      f: eventFile,
      'event-stdin': eventStdin,
      'invocation-type': invocationType = 'sync',
      'sdk-version': sdkVersion,
      'domain-name': domainName,
      'stateful-async-invocation-id': statefulAsyncInvocationId = '',
    } = argsData;

    // @ts-ignore: 判断三个值有几个真
    if (!!event + !!eventFile + !!eventStdin > 1) {
      throw new CatchableError('event | event-file | event-stdin must choose one.');
    }

    if (!['sync', 'async'].includes(invocationType)) {
      throw new CatchableError('invocation-type enum value sync, async.');
    }

    const props: IProperties = {
      region: argsData.region || inputs.props?.region,
      serviceName: argsData['service-name'] || inputs.props?.serviceName,
      functionName: argsData['function-name'] || inputs.props?.functionName,
      domainName: domainName || inputs.props?.domainName,
      qualifier: argsData.qualifier || inputs.props?.qualifier,
    };
    logger.debug(`input args props: ${JSON.stringify(props)}`);

    const eventPayload = await Event.eventPriority({ event, eventFile, eventStdin });
    if (!_.isEmpty(domainName)) {
      return { domainName, event: eventPayload };
    }

    if (!isProperties(props)) {
      throw new CatchableError('region/service-name/function-name can not be empty.');
    }

    if (_.isEmpty(inputs?.credentials)) {
      inputs.credentials = await getCredential(inputs?.project?.access);
    }

    // 超时时间获取的原理：https://github.com/devsapp/fc/issues/480
    const propsTimeout = argsData.timeout || inputs.props?.timeout;
    let timeout = 600;
    if (_.isNumber(propsTimeout)) {
      if (_.isEmpty(inputs.props?.runtime) || inputs.props?.runtime === 'custom-container') {
        timeout = propsTimeout + 7 * 60;
      } else {
        timeout = propsTimeout + 2 * 60;
      }
    }

    return {
      props,
      event: eventPayload,
      isHelp: false,
      parames: {
        invocationType: _.upperFirst(invocationType),
        statefulAsyncInvocationId,
      },
      timeout,
      credPayload: {
        credentials: inputs.credentials,
        sdkVersion,
      },
    };
  }
}
