
import i18n from './i18n';
import { Logger } from '@serverless-devs/core';

export default class ComponentLogger {
  static CONTENT = 'FC-REMOTE-INVOKE';
  static setContent(content) {
    ComponentLogger.CONTENT = content;
  }
  static log(m, color?: 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'whiteBright' | 'gray') {
    Logger.log(i18n.__(m) || m, color);
  }
  static info(m) {
    Logger.info(ComponentLogger.CONTENT, i18n.__(m) || m);
  }

  static debug(m) {
    Logger.debug(ComponentLogger.CONTENT, i18n.__(m) || m);
  }

  static error(m) {
    Logger.error(ComponentLogger.CONTENT, i18n.__(m) || m);
  }

  static warning(m) {
    Logger.warn(ComponentLogger.CONTENT, i18n.__(m) || m);
  }

  static success(m) {
    Logger.log(i18n.__(m) || m, 'green');
  }
}



