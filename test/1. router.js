// const express = require('express'); // 标准库
const express = require('../lib/express');// 自定义库
const app = express();

// express 重要功能：路由
// 通过设定路由规则，可以根据不同的请求方法和路径，响应不同内容

app.get('/moon', (req, res) => {
    res.end('moon');
});
// $ curl -v -X POST http://localhost:8080/wang
app.post('/wang', (req, res) => {
    res.end('wang \r\n');
});

app.listen(8080, () => console.log('启动8080端口服务器'));