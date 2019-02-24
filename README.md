# 玩具版 Express 基础功能实现

> 实现一个玩具版的 Express 框架，理解功能实现思路。采用 TDD 开发模式。

## 1. 目录结构

```
├── LICENSE
├── README.md
├── lib
│   └── express
│       └── index.js 包主入口
├── package-lock.json
├── package.json
└── test 测试用例
    ├── 1.\ router.js
    ├── 2.\ middleware.js
    ├── 2.\ param.js
    ├── 4.\ req.params.js
    ├── 5.\ app.param().js
    └── 6.\ req.send().js
```

## 2. 基本功能

### 2.1 路由功能

> 顺序很重要，先匹配先生效

- 以 get 请求为例：
    1. 通过 get 方法设定路由，框架内部对规则进行缓存
    2. 监听客户端请求时，匹配哦用户请求的 method 和 pathname 来调用缓存的路由 handler
- 通过 method 处理
    - 使用 http.METHODS 来遍历缓存路由规则，不需要再声明一系列缓存方法
- 特殊规则
    - all 方法，匹配任意 method
    - \* 路径，匹配任意 pathname
        - 多用于处理 404，要放在最后

### 2.2 中间件

> 中间件就是处理 HTTP 请求的函数，用来完成各种特定的任务。eg：检查用户是否登录、检测用户是否有权限访问等

使用中间件：
```javascript
app.use([path ,](req, res, next) => {
    // 通用处理...
    next();
});
app.use((err, req, res, next) => {
    console.log('错误处理中间件：' + err)
    res.end('system error');
});
```

基本特点：
- 可以根据路径来区分进行返回执行不同的中间件
    - 中间件的路径匹配只做前缀匹配
    - eg: 设定 /test ，可以匹配 /test/a ，不可以匹配 /testa
- 一个中间件处理完请求和响应可以把控制权交出，给下一个中间件
    - 调用函数体中的 next()，表示将调用下一个中间件
    - next 传参则表示函数发生错误，Express 会跳出后面所有中间件，将错误交给`错误处理中间件`来处理
- 中间件和路由规则使用同一个处理队列，一般要在路由之前设定

### 2.3 req/res 赋能

- req.xx 获取请求参数
    - 通过内置中间件并默认调用的方式，将请求的参数绑定到 req 对象上，方便直接调用
    - eg：req.query、req.path、req.hostname
- req.params 获取路由路径参数
    1. 在设置路由(eg: app.get)时，将路径中的`参数 name 的数组`缓存到路由队列中，并将路径 path 替换成对应的正则表达式备用
    2. 在处理请求时，如果有参数 name 的数组，则使用正则表达式进行匹配，来获取 params，并添加到 req 对象上
    - app.param(name, handler) 方法
        - 说明：任意路由路径中，有 name 这个 param ，都会调用此方法定义的 handler ，用于指定 name 的公用操作处理提取
- res.send([body]) 智能响应
    - 参数为要响应的内容，可以智能处理不同类型的数据，在输出响应时会自动进行一些设置，比如HEAD信息、HTTP缓存支持等等
    - 此处只处理了 Content-type 和 statusCode