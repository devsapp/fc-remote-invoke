export default [
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
]