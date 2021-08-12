/*
 * Copyright (C) 2021 kaikeyun. All rights reserved.
 */
'use strict';

server.get('/getuser', async function (req, res) {
    var response = await callApi('/dev/v1/user', {
        bindid: bind_userid,
        page: 1,        // 第几页, 1表示第一页
        page_size: 20,  // 每页大小, 默认为20
    });
    var json = await response.json();
    res.send(JSON.stringify(json));
});

server.get('/getroom', async function (req, res) {
    var response = await callApi('/dev/v1/room', {
        page: 1,        // 第几页, 1表示第一页
        page_size: 20,  // 每页大小, 默认为20
    });
    var json = await response.json();
    res.send(JSON.stringify(json));
});

server.get('/updateuser', async function (req, res) {
    // 根据bindid查询关联的开课云用户ID
    var response = await callApi('/dev/v1/user/bindid', {bindid: bind_userid});
    var json = await response.json(); // {error: 0, data: {"userid": 1234, "bindid": "user1234"}}

    // 更新用户信息
    var response = await callApi('/dev/v1/user/update', {
        userid: json.data.userid,
        name: '更新昵称',
        icon: 'http://xxxx.xxxx.xxx/',
    });
    var json = await response.json();
    // {error: 0}
    res.send(JSON.stringify(json));
});

server.get('/updateroom', async function (req, res) {
    // 根据bindid查询关联的开课云教室ID
    var response = await callApi('/dev/v1/room/bindid', {bindid: bind_roomid});
    var json = await response.json(); // {error: 0, data: {"roomid": 10001, "bindid": "room10001"}}

    // 更新教室设置
    var response = await callApi('/dev/v1/room/update', {
        roomid: json.data.roomid,
        icon: 'http://xxx.room.xxx',
        ownerid: 1235,
        name: '测试更新2',    // 教室名称(标题)，最大长度64字符
        limit_guest: true,   // 限制游客(非教室成员或机构管理员)进入教室，建议开启
        upmic_count: 4,      // 教室可上麦人数，该值不能大于机构的上麦人数限制
    });
    var json = await response.json();
    // {error: 0}
    res.send(JSON.stringify(json));
});
