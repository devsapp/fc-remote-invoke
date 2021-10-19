import { IProperties, IEventPayload } from '../interface/entity';
export default class RemoteInvoke {
    fcClient: any;
    accountId: string;
    constructor(fcClient: any, accountId: string);
    invoke(props: IProperties, eventPayload: IEventPayload, { invocationType }: {
        invocationType: any;
    }): Promise<void>;
    requestDomain(url: string, event: string): Promise<void>;
    getHttpTrigger(serviceName: any, functionName: any): Promise<any>;
    eventInvoke({ serviceName, functionName, event, qualifier, invocationType }: {
        serviceName: any;
        functionName: any;
        event: any;
        qualifier?: string;
        invocationType: any;
    }): Promise<void>;
    httpInvoke({ region, serviceName, functionName, event, qualifier }: {
        region: any;
        serviceName: any;
        functionName: any;
        event: any;
        qualifier: any;
    }): Promise<void>;
    /**
     * @param event: { body, headers, method, queries, path }
     * path 组装后的路径 /proxy/serviceName/functionName/path ,
     */
    request(event: any): Promise<void>;
    private showLog;
    private getJsonEvent;
}