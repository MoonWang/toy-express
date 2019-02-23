// const express = require('express'); // 标准库
const express = require('../lib/express');// 自定义库
const app = express();

app.use((req, res, next) => {
    console.log('无路径中间件');
    next();
});
app.use('/moon', (req, res, next) => {
    console.log('有路径中间件');
    next();
});

app.get('/moon', (req, res) => {
    res.end('moon');
});

app.listen(8080, _ => { console.log('8080 端口服务器启动')})