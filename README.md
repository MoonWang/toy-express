# 玩具版 Express 框架实现

> 实现一个玩具版的 Express 框架，理解框架设计和使用。

## 1. 测试说明

## 2. 目录结构

## 3. 基本功能

### 3.1 路由功能

> 顺序很重要，先匹配先生效

- 以 get 请求为例：
    1. 通过 get 方法设定路由，框架内部对规则进行缓存
    2. 监听客户端请求时，匹配哦用户请求的 method 和 pathname 来调用缓存的路由 hanlder
- 通过 method 处理
    - 使用 http.METHODS 来遍历缓存路由规则，不需要再声明一系列缓存方法
- 特殊规则
    - all 方法，匹配任意 method
    - \* 路径，匹配任意 pathname
        - 多用于处理 404，要放在最后

### 3.2 中间件

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