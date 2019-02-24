// const express = require('express'); // 标准库
const express = require('../lib/express');// 自定义库
const app = express();

// 功能方法伪代码：从数据库获取用户数据、想数据库写用户数据
function getUser(userId) {
    console.log('入参' + userId);
    return { uid: 1, age: 18, name: 'moon' };
}
function setUser(user) {
    //向数据库里保存用户
}


// 路由1：根据 uid 获取 userInfo.name，然后通过 other 最一些其他处理
// http://localhost:8080/username/1/hhh
app.get('/username/:uid/:other', function (req, res) {
    // let userInfo = getUser(req.params.uid);
    res.end('获取用户 name 成功：' + req.userInfo.name);
});
// 路由2：根据 uid 获取 userInfo.age，然后通过 other 最一些其他处理
// http://localhost:8080/userage/ggg/2
app.get('/userage/:other/:uid', function (req, res) {
    // let userInfo = getUser(req.params.uid);
    res.end('获取用户 age 成功：' + req.userInfo.age);
});

// 可以通过 app.param 方法将通过 uid 获取 userInfo 的公用操作提取
app.param('uid', function (req, res, next, uid) {
    res.setHeader('Content-Type', 'text/html;charset=utf8')
    req.userInfo = getUser(uid);
    next();
});

app.listen(8080, _ => { console.log('8080 端口服务器启动')})