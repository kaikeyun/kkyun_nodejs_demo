#!/usr/bin/env node
/*
 * Copyright (C) 2021 kaikeyun. All rights reserved.
 */
'use strict';

var express = require('express');
var fetch = require('node-fetch');
var server = express();

const api_server = "https://api.kaikeyun.com";
const app_id = "填入机构后台, 开发者设置里的App ID";
const app_key = "填入机构后台, 开发者设置里的App Key";

function callApi(api_url, params) {
    var url = api_server + api_url;
    return fetch(url, {
            method: "POST",
            headers: {
                "Authorization": basicAuth,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
    });
}

server.get('/joinroom', function (req, res) {
    res.send('express 搭建后台服务');
});

server.get('/getrecord', function (req, res) {
    res.send('express 搭建后台服务');
});

var serverPort = 10008;
server.listen(serverPort, function () {
    console.info('http listen at:', serverPort);
});
