// const express = require('express'); // 标准库
const express = require('../lib/express');// 自定义库
const app = express();

// 测试路由：http://localhost:8080/user?age=18&name=moon
app.get('/user', (req, res) => {
    console.log(req.query); // {age: "18", name: "moon"}
    console.log(req.path); // '/user'
    console.log(req.hostname); // 'localhost'
    console.log(req); // 还可以拿到其他 http 请求参数

    res.end('end');
});

app.listen(8080, _ => { console.log('8080 端口服务器启动')})