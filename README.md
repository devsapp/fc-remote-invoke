## 组件说明

fc-remote-invoke 组件调用 FC 函数。

## 带有 YAML 文件用法

### yaml 配置

````
edition: 1.0.0        #  命令行YAML规范版本，遵循语义化版本（Semantic Versioning）规范
name: compoent-test   #  项目名称

services:
  component-test:
    component: devsapp/fc-remote-invoke  # 这里引入的是相对路径，正式配置替换成你自己的component名称即可 
    props:
      region: ${region}
      serviceName: ${serviceName}
      functionName: ${functionName}
````

### 函数调用


````
$ s exec -- invoke --invocation-type sync --event ${payload}
$ s exec -- invoke --invocation-type async --event-file ${path}
$ s exec -- invoke --event-stdin
````

## CLI 用法

````
$ s cli fc-remote-invoke invoke --region * --service-name * --function-name * --invocation-type sync --event ${payload}
$ s cli fc-remote-invoke invoke --region * --service-name * --function-name * --invocation-type async --event-file ${path}
$ s cli fc-remote-invoke invoke --region * --service-name * --function-name * --event-stdin
````

## 特别说明

当函数是 http 函数时，event最终获取值目前仅支持 json 字符串，[示例参考](https://github.com/devsapp/fc-remote-invoke/blob/master/example/http.json)

invocation-type 选填，默认 sync
event 选填，event 函数默认为空字符串，http 函数默认 GET 请求，其他参数为空