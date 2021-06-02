import { InputProps } from './interface/entity';
export default class FcRemoteInvoke {
    report(componentName: string, command: string, accountID: string): Promise<void>;
    handlerInputs(inputs: InputProps): Promise<any>;
    /**
     * event 函数本地调试
     * @param inputs
     * @returns
     */
    invoke(inputs: InputProps): Promise<any>;
}
