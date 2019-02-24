// const express = require('express'); // 标准库
const express = require('../lib/express');// 自定义库
const app = express();

// 参数为要响应的内容，可以智能处理不同类型的数据，在输出响应时会自动进行一些设置，比如HEAD信息、HTTP缓存支持等等

// eg: http://localhost:8080/
app.get('/', function (req, res) {
    // res.send('<p>hello world</p>');
    // res.send({obj:1});
    // res.send([1,2,3]);
    res.send(404);
});

app.listen(8080, _ => { console.log('8080 端口服务器启动')})