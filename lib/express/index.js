const http = require('http');
const url = require('url');


// 0.1 app = express(); 通过入口方法创建 app
function createApplication() {
    // 0.3 app 是真正的请求监听函数
    const app = function(req, res) {
        // 1.2 根据请求调用不同的路由规则
        let { pathname } = url.parse(req.url, true);
        for(let i = 0; i < app.routes.length; i++) {
            let route = app.routes[i];
            // 1.3 all 方法 和 * 路径
            if((route.method == req.method.toLowerCase() || route.method == 'all') 
                && (route.path == pathname || route.path == '*')) {
                return route.hanlder(req, res);
            }
        }
        res.end(`Cannot ${req.method} ${pathname} --from toy`);
    };

    // 0.2 服务器的创建和启动时在 app.listen
    app.listen = function() {
        let server = http.createServer(app);
        server.listen.apply(server, arguments);
    }

    // 1.1 缓存用户设定的路由规则
    app.routes = [];
    http.METHODS.forEach(method => {
        method = method.toLowerCase();
        app[method] = function(path, hanlder) {
            app.routes.push({
                method,
                path,
                hanlder
            });
        };
    });
    // 1.3 all 规则
    app.all = function(path, hanlder) {
        app.routes.push({
            method: 'all',
            path,
            hanlder
        });
    };

    return app;
}

module.exports = createApplication;