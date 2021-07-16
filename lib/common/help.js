"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        header: 'Invoke',
        content: 'Invoke/trigger online functions.',
    },
    {
        header: 'Usage',
        content: '$ s invoke <options>',
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'invocation-type',
                description: 'Invocation type: optional value "async"|"sync", default value "sync" (default: "sync")',
                type: String,
            },
            {
                name: 'event',
                description: 'Event data (strings) passed to the function during invocation (default: "").Http function format refers to [https://github.com/devsapp/fc-remote-invoke#特别说明]',
                type: String,
            },
            {
                name: 'event-file',
                description: 'Event funtion: A file containing event data passed to the function during invoke. Http function: A file containing http request options sent to http trigger. Format refers to [https://github.com/devsapp/fc-remote-invoke#特别说明]',
                alias: 'f',
                type: String,
            },
            {
                name: 'event-stdin',
                description: 'Read from standard input, to support script pipeline.Http function format refers to [https://github.com/devsapp/fc-remote-invoke#特别说明]',
                type: Boolean,
            },
            {
                name: 'region',
                description: 'Specify region in cli mode',
                type: String,
            },
            {
                name: 'service-name',
                description: 'Specify service name in cli mode',
                type: String,
            },
            {
                name: 'function-name',
                description: 'Specify function name in cli mode',
                type: String,
            },
            {
                name: 'domain-name',
                description: 'Specify custom domain name in cli mode',
                type: String,
            },
        ],
    },
    {
        header: 'Global Options',
        optionList: [
            {
                name: 'access',
                description: 'Specify key alias.',
                alias: 'a',
                type: Boolean,
            },
            {
                name: 'help',
                description: 'fc-remote-invoke help for command.',
                alias: 'h',
                type: Boolean,
            },
        ],
    },
    {
        header: 'Examples with Yaml',
        content: [
            '$ s invoke',
            '$ s <ProjectName> invoke',
            '$ s exec -- invoke --invocation-type sync --event <payload>',
            '$ s exec -- invoke --event-file <file-path>',
            '$ s exec -- invoke --event-stdin',
        ],
    },
    {
        header: 'Examples with CLI',
        content: [
            {
                example: '$ s cli fc-remote-invoke invoke --region * --service-name * --function-name * --event <payload>',
            },
            {
                example: '$ s cli fc-remote-invoke invoke --region * --service-name * --function-name * --event-file <file-path>',
            },
            {
                example: '$ s cli fc-remote-invoke invoke --region * --service-name * --function-name * --event-stdin',
            },
            {
                example: '\nYou also can refer to the usage of fc-api and execute [s cli fc-api -h] for help.   $ s cli fc-api invokeFunction -h',
            },
        ],
    },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vaGVscC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtCQUFlO0lBQ2I7UUFDRSxNQUFNLEVBQUUsUUFBUTtRQUNoQixPQUFPLEVBQUUsa0NBQWtDO0tBQzVDO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsT0FBTztRQUNmLE9BQU8sRUFBRSxzQkFBc0I7S0FDaEM7SUFDRDtRQUNFLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRTtZQUNWO2dCQUNFLElBQUksRUFBRSxpQkFBaUI7Z0JBQ3ZCLFdBQVcsRUFBRSx3RkFBd0Y7Z0JBQ3JHLElBQUksRUFBRSxNQUFNO2FBQ2I7WUFDRDtnQkFDRSxJQUFJLEVBQUUsT0FBTztnQkFDYixXQUFXLEVBQUUsK0pBQStKO2dCQUM1SyxJQUFJLEVBQUUsTUFBTTthQUNiO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLFdBQVcsRUFBRSxtT0FBbU87Z0JBQ2hQLEtBQUssRUFBRSxHQUFHO2dCQUNWLElBQUksRUFBRSxNQUFNO2FBQ2I7WUFDRDtnQkFDRSxJQUFJLEVBQUUsYUFBYTtnQkFDbkIsV0FBVyxFQUFFLHdJQUF3STtnQkFDckosSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLElBQUksRUFBRSxRQUFRO2dCQUNkLFdBQVcsRUFBRSw0QkFBNEI7Z0JBQ3pDLElBQUksRUFBRSxNQUFNO2FBQ2I7WUFDRDtnQkFDRSxJQUFJLEVBQUUsY0FBYztnQkFDcEIsV0FBVyxFQUFFLGtDQUFrQztnQkFDL0MsSUFBSSxFQUFFLE1BQU07YUFDYjtZQUNEO2dCQUNFLElBQUksRUFBRSxlQUFlO2dCQUNyQixXQUFXLEVBQUUsbUNBQW1DO2dCQUNoRCxJQUFJLEVBQUUsTUFBTTthQUNiO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLGFBQWE7Z0JBQ25CLFdBQVcsRUFBRSx3Q0FBd0M7Z0JBQ3JELElBQUksRUFBRSxNQUFNO2FBQ2I7U0FDRjtLQUNGO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsZ0JBQWdCO1FBQ3hCLFVBQVUsRUFBRTtZQUNWO2dCQUNFLElBQUksRUFBRSxRQUFRO2dCQUNkLFdBQVcsRUFBRSxvQkFBb0I7Z0JBQ2pDLEtBQUssRUFBRSxHQUFHO2dCQUNWLElBQUksRUFBRSxPQUFPO2FBQ2Q7WUFDRDtnQkFDRSxJQUFJLEVBQUUsTUFBTTtnQkFDWixXQUFXLEVBQUUsb0NBQW9DO2dCQUNqRCxLQUFLLEVBQUUsR0FBRztnQkFDVixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7S0FDRjtJQUNEO1FBQ0UsTUFBTSxFQUFFLG9CQUFvQjtRQUM1QixPQUFPLEVBQUU7WUFDUCxZQUFZO1lBQ1osMEJBQTBCO1lBQzFCLDZEQUE2RDtZQUM3RCw2Q0FBNkM7WUFDN0Msa0NBQWtDO1NBQ25DO0tBQ0Y7SUFDRDtRQUNFLE1BQU0sRUFBRSxtQkFBbUI7UUFDM0IsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsT0FBTyxFQUFFLGlHQUFpRzthQUMzRztZQUNEO2dCQUNFLE9BQU8sRUFBRSx3R0FBd0c7YUFDbEg7WUFDRDtnQkFDRSxPQUFPLEVBQUUsNkZBQTZGO2FBQ3ZHO1lBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLHdIQUF3SDthQUNsSTtTQUNGO0tBQ0Y7Q0FDRixDQUFBIn0=