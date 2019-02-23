// const express = require('express'); // 标准库
const express = require('../lib/express');// 自定义库
const app = express();

// :表示该部分是占位符，用来匹配任意字符串
// eg: http://localhost:8080/user/moon/123
app.get('/user/:name/:uid', function (req, res) {
    console.log(req.params);
    res.end('end');
});

app.listen(8080, _ => { console.log('8080 端口服务器启动')})