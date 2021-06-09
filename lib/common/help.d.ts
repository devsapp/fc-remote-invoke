declare const _default: ({
    header: string;
    content: string;
    optionList?: undefined;
} | {
    header: string;
    optionList: ({
        name: string;
        description: string;
        alias: string;
        type: StringConstructor;
    } | {
        name: string;
        description: string;
        alias: string;
        type: BooleanConstructor;
    } | {
        name: string;
        description: string;
        type: StringConstructor;
        alias?: undefined;
    })[];
    content?: undefined;
} | {
    header: string;
    content: string[];
    optionList?: undefined;
})[];
export default _default;
