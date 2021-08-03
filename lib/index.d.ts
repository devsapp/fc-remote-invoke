import { InputProps } from './interface/entity';
export default class FcRemoteInvoke {
    /**
     * event 函数本地调试
     * @param inputs
     * @returns
     */
    invoke(inputs: InputProps): Promise<any>;
    private report;
    private handlerInputs;
}
