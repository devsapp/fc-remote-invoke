export interface ICredentials {
  AccountID?: string;
  AccessKeyID?: string;
  AccessKeySecret?: string;
  SecurityToken?: string;
}

export interface InputProps {
  props?: IProperties; // 用户自定义输入
  credentials: ICredentials; // 用户秘钥
  appName: string; //
  project: {
    component: string; // 组件名（支持本地绝对路径）
    access: string; // 访问秘钥名
    projectName: string; // 项目名
  };
  command: string; // 执行指令
  args: string; // 命令行 扩展参数
  path: {
    configPath: string; // 配置路径
  };
}

export interface IProperties {
  region: string;
  serviceName: string;
  functionName: string;
  runtime?: string;
  qualifier?: string;
  domainName?: string;
  timeout?: string;
}
export function isProperties(args: any): args is IProperties {
  if (!args) {
    return false;
  }
  return args.domainName || (args.region && args.serviceName && args.functionName);
}
