import _ from 'lodash';
import qs from 'qs';
import FormData from 'form-data';

export default function handlerBody(contentType: string, body: any) {
  if (contentType.includes('text/') || contentType.includes('application/json') || contentType.includes('application/xml')) {
    if (_.isString(body)) return body;
    try {
      return JSON.stringify(body);
    } catch (_ex) {
      return body.toString();
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return qs.stringify(body, { indices: false });
  }

  if (contentType.includes('multipart/form-data')) {
    const form = new FormData();
    try {
      const newBody = _.isObject(body) ? body : JSON.parse(body);
      for (const [key, value] of Object.entries(newBody)) {
        form.append(key, value);
      }
      return form;
    } catch (_ex) {
      throw new Error(`Handler body error: The request header is ${contentType}, but the request body is not an object`);
    }

  }

  return body;
}
