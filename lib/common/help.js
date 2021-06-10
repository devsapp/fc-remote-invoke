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
                alias: 't',
                type: String,
            },
            {
                name: 'event',
                description: 'Event data (strings) passed to the function during invocation (default: "").Http function format refers to [https://github.com/devsapp/fc-remote-invoke#特别说明]',
                alias: 'e',
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
                alias: 's',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vaGVscC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtCQUFlO0lBQ2I7UUFDRSxNQUFNLEVBQUUsUUFBUTtRQUNoQixPQUFPLEVBQUUsa0NBQWtDO0tBQzVDO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsT0FBTztRQUNmLE9BQU8sRUFBRSxzQkFBc0I7S0FDaEM7SUFDRDtRQUNFLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRTtZQUNWO2dCQUNFLElBQUksRUFBRSxpQkFBaUI7Z0JBQ3ZCLFdBQVcsRUFBRSx3RkFBd0Y7Z0JBQ3JHLEtBQUssRUFBRSxHQUFHO2dCQUNWLElBQUksRUFBRSxNQUFNO2FBQ2I7WUFDRDtnQkFDRSxJQUFJLEVBQUUsT0FBTztnQkFDYixXQUFXLEVBQUUsK0pBQStKO2dCQUM1SyxLQUFLLEVBQUUsR0FBRztnQkFDVixJQUFJLEVBQUUsTUFBTTthQUNiO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLFdBQVcsRUFBRSxtT0FBbU87Z0JBQ2hQLEtBQUssRUFBRSxHQUFHO2dCQUNWLElBQUksRUFBRSxNQUFNO2FBQ2I7WUFDRDtnQkFDRSxJQUFJLEVBQUUsYUFBYTtnQkFDbkIsV0FBVyxFQUFFLHdJQUF3STtnQkFDckosS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLElBQUksRUFBRSxRQUFRO2dCQUNkLFdBQVcsRUFBRSw0QkFBNEI7Z0JBQ3pDLElBQUksRUFBRSxNQUFNO2FBQ2I7WUFDRDtnQkFDRSxJQUFJLEVBQUUsY0FBYztnQkFDcEIsV0FBVyxFQUFFLGtDQUFrQztnQkFDL0MsSUFBSSxFQUFFLE1BQU07YUFDYjtZQUNEO2dCQUNFLElBQUksRUFBRSxlQUFlO2dCQUNyQixXQUFXLEVBQUUsbUNBQW1DO2dCQUNoRCxJQUFJLEVBQUUsTUFBTTthQUNiO1NBQ0Y7S0FDRjtJQUNEO1FBQ0UsTUFBTSxFQUFFLGdCQUFnQjtRQUN4QixVQUFVLEVBQUU7WUFDVjtnQkFDRSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsb0JBQW9CO2dCQUNqQyxLQUFLLEVBQUUsR0FBRztnQkFDVixJQUFJLEVBQUUsT0FBTzthQUNkO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLE1BQU07Z0JBQ1osV0FBVyxFQUFFLG9DQUFvQztnQkFDakQsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO0tBQ0Y7SUFDRDtRQUNFLE1BQU0sRUFBRSxvQkFBb0I7UUFDNUIsT0FBTyxFQUFFO1lBQ1AsWUFBWTtZQUNaLDBCQUEwQjtZQUMxQiw2REFBNkQ7WUFDN0QsNkNBQTZDO1lBQzdDLGtDQUFrQztTQUNuQztLQUNGO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsbUJBQW1CO1FBQzNCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLE9BQU8sRUFBRSxpR0FBaUc7YUFDM0c7WUFDRDtnQkFDRSxPQUFPLEVBQUUsd0dBQXdHO2FBQ2xIO1lBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLDZGQUE2RjthQUN2RztZQUNEO2dCQUNFLE9BQU8sRUFBRSx3SEFBd0g7YUFDbEk7U0FDRjtLQUNGO0NBQ0YsQ0FBQSJ9