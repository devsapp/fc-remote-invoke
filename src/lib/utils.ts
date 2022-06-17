import { CatchableError, lodash as _, got } from '@serverless-devs/core';
import logger from '../common/logger';

export const getJsonEvent = (event) => {
  try {
    return event ? JSON.parse(event) : {};
  } catch (ex) {
    logger.debug(ex);
    throw new CatchableError(
      'handler event error, JSON format required.',
      `Example: {
  "method": "POST",
  "headers": {
    "key": "value",
    "Content-Type": "application/json"
  },
  "queries": {
    "key": "value"
  },
  "body": {
    "key": "value"
  },
  "path": "download"
}`,
    );
  }
};

export const showLog = (log, instanceId) => {
  if (log) {
    logger.log('\n========= FC invoke Logs begin =========', 'yellow');
    const decodedLog = Buffer.from(log, 'base64');
    logger.log(decodedLog.toString());
    logger.log('========= FC invoke Logs end =========', 'yellow');
  }
  if (instanceId) {
    logger.log(`\n\x1B[32mFC Invoke instanceId:\x1B[0m ${instanceId}`);
  }
};

export const getInstanceId = (headers) => _.get(headers, 'x-fc-instance-id');

export const requestDomain = async (url: string, payload) => {
  logger.log(`\nRequest url: ${url}`);

  const isAsync = _.get(payload, 'headers[X-Fc-Invocation-Type]', '').toLocaleLowerCase() === 'async';
  _.set(payload, 'headers[X-Fc-Log-Type]', isAsync ? 'None' : 'Tail');
  const { statusCode, body, headers } = await got(url, payload);

  if (isAsync) {
    logger.log(`\nFC Invoke Result:`, 'green');
    logger.log(`Code: ${statusCode}`, 'green');
    logger.log(`RequestId: ${_.get(headers, 'x-fc-request-id', '')}\n`, 'green');
  } else {
    showLog(headers['x-fc-log-result'], getInstanceId(headers));
    logger.log('\nFC Invoke Result:', 'green');
    console.log(body);
    logger.log('\n');
  }
};
