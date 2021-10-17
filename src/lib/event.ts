import path from 'path';
import fs from 'fs-extra';
import { isString } from 'lodash';
import readline from 'readline';
import logger from '../common/logger';
import { getStdin } from './stdin';

export default class File {

  static async getEvent(eventFile) {
    let event = await getStdin(); // read from pipes

    if (!eventFile) return event;

    return await new Promise((resolve, reject) => {
      let input;

      if (eventFile === '-') { // read from stdin
        logger.log('Reading event data from stdin, which can be ended with Enter then Ctrl+D');
        input = process.stdin;
      } else {
        logger.log('Reading event file content:');
        input = fs.createReadStream(eventFile, {
          encoding: 'utf-8'
        })
      }
      const rl = readline.createInterface({
        input,
        output: process.stdout
      })

      event = '';
      rl.on('line', (line) => {
        event += line
      })
      rl.on('close', () => {
        logger.log('');
        resolve(event)
      })

      rl.on('SIGINT', () => reject(new Error('^C')))
    })
  }

  static async eventPriority(eventPriority) {
    let eventFile: string;

    if (isString(eventPriority.event)) {
      return eventPriority.event;
    } else if (eventPriority.eventStdin) {
      eventFile = '-';
    } else if (eventPriority.eventFile) {
      eventFile = path.resolve(process.cwd(), eventPriority.eventFile);
    }

    return await this.getEvent(eventFile)
  }
}