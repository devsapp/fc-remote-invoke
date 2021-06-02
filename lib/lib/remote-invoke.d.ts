import { IProperties, IEventPayload } from '../interface/entity';
export default class RemoteInvoke {
    fcClient: any;
    accountId: string;
    constructor(region: string, credentials: any);
    invoke(props: IProperties, eventPayload: IEventPayload, { invocationType }: {
        invocationType: any;
    }): Promise<void>;
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
    handlerHttpParmase(event: any): {
        headers: any;
        queries: any;
        method: any;
        path: any;
        body: any;
    };
}
