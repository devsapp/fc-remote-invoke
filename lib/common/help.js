"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        header: 'Remote Invoke',
        content: 'Remote Invoke',
    },
    {
        header: 'Usage',
        content: '$ fc-remote-invoke invoke <options>',
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'invocation-type',
                description: 'Invocation type: optional value "async"|"sync", default value "sync" (default: "sync")',
                alias: '-t',
                type: String,
            },
            {
                name: 'event',
                description: 'Event data (strings) passed to the function during invocation (default: "")',
                alias: '-e',
                type: String,
            },
            {
                name: 'event-file',
                description: 'A file containing event data passed to the function during invoke.',
                alias: '-f',
                type: String,
            },
            {
                name: 'event-stdin',
                description: 'Read from standard input, to support script pipeline.',
                alias: '-s',
                type: Boolean,
            },
            {
                name: 'region',
                description: 'Pass in region in cli mode',
                type: String,
            },
            {
                name: 'service',
                description: 'Pass in service name in cli mode',
                type: String,
            },
            {
                name: 'function',
                description: 'Pass in function name in cli mode',
                type: String,
            },
            {
                name: 'help',
                description: 'Help for remote invoke.',
                alias: 'h',
                type: Boolean,
            },
        ],
    },
    {
        header: 'YAML Examples',
        content: [
            '$ s exec -- invoke <options>',
        ],
    },
    {
        header: 'CLI Examples',
        content: [
            '$ s cli fc-remote-invoke invoke --region * --service * --function * <options>',
        ],
    },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vaGVscC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtCQUFlO0lBQ2I7UUFDRSxNQUFNLEVBQUUsZUFBZTtRQUN2QixPQUFPLEVBQUUsZUFBZTtLQUN6QjtJQUNEO1FBQ0UsTUFBTSxFQUFFLE9BQU87UUFDZixPQUFPLEVBQUUscUNBQXFDO0tBQy9DO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsU0FBUztRQUNqQixVQUFVLEVBQUU7WUFDVjtnQkFDRSxJQUFJLEVBQUUsaUJBQWlCO2dCQUN2QixXQUFXLEVBQUUsd0ZBQXdGO2dCQUNyRyxLQUFLLEVBQUUsSUFBSTtnQkFDWCxJQUFJLEVBQUUsTUFBTTthQUNiO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsV0FBVyxFQUFFLDZFQUE2RTtnQkFDMUYsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsSUFBSSxFQUFFLE1BQU07YUFDYjtZQUNEO2dCQUNFLElBQUksRUFBRSxZQUFZO2dCQUNsQixXQUFXLEVBQUUsb0VBQW9FO2dCQUNqRixLQUFLLEVBQUUsSUFBSTtnQkFDWCxJQUFJLEVBQUUsTUFBTTthQUNiO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLGFBQWE7Z0JBQ25CLFdBQVcsRUFBRSx1REFBdUQ7Z0JBQ3BFLEtBQUssRUFBRSxJQUFJO2dCQUNYLElBQUksRUFBRSxPQUFPO2FBQ2Q7WUFDRDtnQkFDRSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsNEJBQTRCO2dCQUN6QyxJQUFJLEVBQUUsTUFBTTthQUNiO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsV0FBVyxFQUFFLGtDQUFrQztnQkFDL0MsSUFBSSxFQUFFLE1BQU07YUFDYjtZQUNEO2dCQUNFLElBQUksRUFBRSxVQUFVO2dCQUNoQixXQUFXLEVBQUUsbUNBQW1DO2dCQUNoRCxJQUFJLEVBQUUsTUFBTTthQUNiO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLE1BQU07Z0JBQ1osV0FBVyxFQUFFLHlCQUF5QjtnQkFDdEMsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO0tBQ0Y7SUFDRDtRQUNFLE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLE9BQU8sRUFBRTtZQUNQLDhCQUE4QjtTQUMvQjtLQUNGO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsY0FBYztRQUN0QixPQUFPLEVBQUU7WUFDUCwrRUFBK0U7U0FDaEY7S0FDRjtDQUNGLENBQUEifQ==