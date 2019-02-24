const http = require('http');
const url = require('url');


// 0.1 app = express(); 通过入口方法创建 app
function createApplication() {
    // 0.3 app 是真正的请求监听函数
    const app = function (req, res) {
        let { pathname } = url.parse(req.url, true);

        let index = 0;
        // 2.2 定义 next 方法
        function next(err) {
            // 2.2.3 边界条件
            if (index >= app.routes.length) {
                return res.end(`Cannot ${req.method} ${pathname} --from toy`);
            }

            let route = app.routes[index++];

            // 2.3 中间件抛错处理
            if(err) {
                // 2.3.1 先判断是中间件
                if (route.method == 'middleware') { 
                    // 2.3.2 再判断中间件路径
                    if (route.path == '/' ||
                        pathname.startsWith(route.path + '/') ||
                        pathname == route.path) {
                        // 2.3.4 再判断是否错误处理中间件，判断形参个数即可
                        if (route.handler.length == 4) {
                            route.handler(err, req, res, next);
                        } else {
                            next(err);
                        }
                    } else {
                        next(err);
                    }
                } else {
                    next(err);
                }
                return;
            } 

            // 2.2.1 先处理中间件，再处理路由
            if (route.method == 'middleware') { // 中间件
                // 2.2.2 路径匹配，全路径匹配、前缀匹配、路径相等
                if (route.path == '/' ||
                    pathname.startsWith(route.path + '/') ||
                    pathname == route.path) {
                    // 命中路径时，需要用户「手动调用」 next 来向下执行
                    route.handler(req, res, next);
                } else {
                    // 未匹配到路径则不执行中间件 handler，内部调用 next 继续向下执行
                    next();
                }
            } else { // 路由
                // 3.2.2 判断是否需要用正则方式匹配路径
                if (route.paramsNames) {
                    let matchers = pathname.match(route.path);
                    // 匹配成功，则提取 params 参数
                    if (matchers) {
                        let params = {};
                        route.paramsNames.forEach((name, index) => {
                            // 注意：matchers[0] 是匹配结果字符串
                            params[name] = matchers[index + 1];
                        });
                        req.params = params;

                        // 3.3.2 查看是否有 param 存在对应 handler 需要执行
                        // 注意：此处需要用到 return 暂停执行，将控制权交给 param 对应的 handler ，所以不能使用 forEach 方法
                        for (let j = 0; j < route.paramsNames.length; j++) {
                            let name = route.paramsNames[j];
                            let handler = app.paramHandlers[name];
                            if (handler) {
                                // 参数3的 next 方法应该是闭包缓存原来的 route.handler(req, res); 用以实现继续向下执行当前路由的 handler 回调，而不是前面定义的 next 方法，会跳过当前路由的执行
                                return handler(req, res, () => route.handler(req, res), req.params[name]);
                            }
                        }
                        return route.handler(req, res);
                    } else {
                        next();
                    }
                } else {
                    // 1.2 根据请求调用不同的路由规则
                    if ((route.method == req.method.toLowerCase() || route.method == 'all') &&
                        (route.path == pathname || route.path == '*')) {
                        // 路由匹配成功
                        return route.handler(req, res);
                    } else {
                        // 路由匹配失败，继续向下匹配
                        next();
                    }
                }
            }
        }
        next();
    };

    // 0.2 服务器的创建和启动时在 app.listen
    app.listen = function () {
        let server = http.createServer(app);
        server.listen.apply(server, arguments);
    }

    // 1.1 缓存用户设定的路由规则
    app.routes = [];
    http.METHODS.forEach(method => {
        method = method.toLowerCase();
        app[method] = function (path, handler) {
            // 3.2 req.params 获取路由路径参数
            let layer = { method, path, handler };
            // 3.2.1 判断是否需要处理 params ，如果需要则提取变量名缓存，并将 path 转换成正则表达式
            if(path.includes(':')) {
                let paramsNames = [];
                // 匹配非 / 的字符串
                // 注意：此处不可以使用箭头函数 
                path = path.replace(/:([^\/]+)/g, function() {
                    paramsNames.push(arguments[1]); // 将匹配到的 name 存起来
                    return '([^\/]+)';  // 将路径中的参数部分替换成正则
                });
                // 将数据缓存到路由对象中
                layer.path = new RegExp(path);
                layer.paramsNames = paramsNames;
            }

            app.routes.push(layer);
        };
    });
    // 1.3 all 规则
    app.all = function (path, handler) {
        app.routes.push({
            method: 'all',
            path,
            handler
        });
    };

    // 2.1 定义 app.use 方法，用于添加中间件回调
    app.use = function (path, handler) {
        if (typeof handler != 'function') {
            handler = path;
            path = '/'; // 根路径匹配所有路径
        }

        app.routes.push({
            method: 'middleware', // 可以通过 method 值区分中间件和路由，也可以用指定 key
            path,
            handler
        });
    };

    // 3.1 内置中间件，用于为请求和响应对象添加一些方法和属性
    app.use((req, res, next) => {
        let { query, pathname } = url.parse(req.url, true);
        req.query = query;
        req.path = pathname;
        req.hostname = req.headers['host'].split(':')[0];
        next();
    });

    // 3.3 app.param 方法设计
    // 3.3.1 缓存 name 和 handler 的对应关系
    app.paramHandlers = {};
    app.param = function(name, handler) {
        app.paramHandlers[name] = handler;
    };

    return app;
}

module.exports = createApplication;