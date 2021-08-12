#!/usr/bin/env node
/*
 * Copyright (C) 2021 kaikeyun. All rights reserved.
 */
'use strict';

const express = require('express');
const fetch = require('node-fetch');
const crypto = require('crypto');
const server = express();

const api_server = "https://api.kaikeyun.com";
const app_id = "填入机构后台, 开发者设置里的App ID";
const app_key = "填入机构后台, 开发者设置里的App Key";

const bind_userid = "user1234";
const bind_roomid = "room10001";

function callApi(api_url, params) {
    var url = api_server + api_url;
    var body = JSON.stringify(params);
    var ts = String(parseInt(Date.now() / 1000));
    var sign_parts = ['POST', api_url, ts, body, app_key];
    var sign_data = sign_parts.join('\n');
    var sign = crypto.createHash('md5').update(sign_data).digest('hex');
    var auth = "KKYUN " + app_id + ":" + ts + ":" + sign;
    return fetch(url, {
            method: "POST",
            headers: {
                "Authorization": auth,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: body,
    });
}

global.bind_userid = bind_userid;
global.bind_roomid = bind_roomid;
global.server = server;
global.callApi = callApi;

server.get('/joinroom', async function (req, res) {
    // 创建并绑定用户
    var response = await callApi('/dev/v1/user/create', {
        bindid: bind_userid, // 绑定接入方的用户ID(机构原有APP里的用户唯一标识)，同一个bindid多次调用create只会创建一个开课云用户
        icon: '',            // 用户头像，必须是http或https开头，最大长度256字符
        name: '测试用户',    // 用户昵称，最大长度64字符
    });
    var json = await response.json();   // {error: 0, data: {"userid": 10043}}
    var kky_userid = json.data.userid;

    // 创建并绑定教室
    var response = await callApi('/dev/v1/room/create', {
        bindid: bind_roomid, // 绑定接入方的教室ID(机构原有APP里的教室唯一标识)，同一个bindid多次调用create只会创建一个开课云教室
        icon: '',            // 教室图标，必须是http或https开头，最大长度256字符
        name: '测试教室',    // 教室名称(标题)，最大长度64字符
        ownerid: kky_userid, // 教室所有者用户ID，所有者进入教室后拥有最高权限
        limit_guest: true,   // 限制游客(非教室成员或机构管理员)进入教室，建议开启
        upmic_count: 2,      // 教室可上麦人数，该值不能大于机构的上麦人数限制
    });
    var json = await response.json();   // {error: 0, data: {"roomid": 10043}}
    var kky_roomid = json.data.roomid;

    // 生成进教室令牌
    var response = await callApi('/dev/v1/room/token', {
        roomid: kky_roomid,             // 要进入的教室ID
        userid: kky_userid,             // 进入教室的用户ID
        role: 'teacher',                // 用户进教室后的角色: teacher, student
    });
    var json = await response.json();
    // {error: 0, data: {"roomid": 10001, "userid": 1234, "token": "xxxxxxxxx", "expire": 3600}}
    res.send(JSON.stringify(json));
});

server.get('/getrecord', async function (req, res) {
    // 根据bindid查询关联的开课云用户ID
    var response = await callApi('/dev/v1/user/bindid', {bindid: bind_userid});
    var json = await response.json(); // {error: 0, data: {"userid": 1234, "bindid": "user1234"}}
    if (json.error) {
        res.send(JSON.stringify(json));
        return;
    }

    var userid = json.data.userid;

    // 根据bindid查询关联的开课云教室ID
    var response = await callApi('/dev/v1/room/bindid', {bindid: bind_roomid});
    var json = await response.json(); // {error: 0, data: {"roomid": 10001, "bindid": "room10001"}}
    if (json.error) {
        res.send(JSON.stringify(json));
        return;
    }

    // 根据roomid查询上课回放
    var response = await callApi('/dev/v1/record', {
        roomid: json.data.roomid,
        get_expired: false, // 是否返回已过期的回放
        page: 1,            // 第几页, 1表示第一页
        page_size: 20,      // 每页大小, 默认为20
    });
    var json = await response.json();
    if (!json.data || !json.data[0]) {
        res.send(JSON.stringify(json));
        return;
    }
    /*
      {"error":0,
       "data":[{"nroomid":10165,
                "cname":"测试更新2",
                "cicon":"http://xxx.room.xxx",
                "nuserid":1234,
                "dbegin":"2021-08-11T18:26:30+0000",
                "crecid":"20210812023019",
                "dend":"2021-08-11T18:30:19+0000"}],
       "pagination":{"count":2,"page_size":20,"page":1,"total_page":1}}
     */

    // 生成播放令牌
    var response = await callApi('/dev/v1/record/token', {
        recid: json.data[0].crecid,
        userid: userid,
    });
    var json = await response.json();
    // {error: 0, data: {"recid": "20210812023019", "userid": 1234, "token": "xxxxxxxxx", "expire": 3600}}
    res.send(JSON.stringify(json));
});

var serverPort = 10008;
server.listen(serverPort, function () {
    console.info('http listen at:', serverPort);
});

const extra_test = require('./extra_test');
