export default [
  {
    header: 'Description',
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
        description: 'Pass in region in cli mode',
        type: String,
      },
      {
        name: 'service-name',
        description: 'Pass in service name in cli mode',
        type: String,
      },
      {
        name: 'function-name',
        description: 'Pass in function name in cli mode',
        type: String,
      },
    ],
  },
  {
    header: 'Global Options',
    optionList: [
      {
        name: 'help',
        description: 'fc-remote-invoke help for command',
        alias: 'h',
        type: Boolean,
      },
    ],
  },
  {
    header: 'Examples with Yaml',
    content: [
      '$ s exec -- invoke --invocation-type sync --event [payload]',
      '$ s exec -- invoke --invocation-type async --event-file [path]',
      '$ s exec -- invoke --event-stdin',
    ],
  },
  {
    header: 'Examples with Cli',
    content: [
      '$ s cli fc-remote-invoke invoke --region * --service-name * --function-name * --event [payload]',
      '$ s cli fc-remote-invoke invoke --region * --service-name * --function-name * --event-file [path]',
      '$ s cli fc-remote-invoke invoke --region * --service-name * --function-name * --event-stdin',
    ],
  },
]