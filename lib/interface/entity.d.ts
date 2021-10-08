export interface ICredentials {
    AccountID?: string;
    AccessKeyID?: string;
    AccessKeySecret?: string;
    SecurityToken?: string;
}
export interface InputProps {
    props?: IProperties;
    credentials: ICredentials;
    appName: string;
    project: {
        component: string;
        access: string;
        projectName: string;
    };
    command: string;
    args: string;
    path: {
        configPath: string;
    };
}
export interface IProperties {
    region: string;
    serviceName: string;
    functionName: string;
    qualifier?: string;
    domainName?: string;
}
export declare function isProperties(args: any): args is IProperties;
export interface IEventPayload {
    event?: string;
    eventFile?: string;
    eventStdin?: boolean;
}
