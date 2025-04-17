#!/usr/bin/env node
'use strict';


const mysql = require('mysql2/promise');
const querystring = require('querystring');
require('dotenv').config({
    path: "../../../../.env"
});
const html = require('../cgi/templates.jss');
const cook = require('../cgi/cook.jss');
const myjwt = require('../cgi/jwtlib.jss');
const { showDBError, connectToDB } = require('../cgi/hz.jss');


let body = '';
process.stdin.on('data', (chunk) => {

    body += chunk.toString();

}).on('end', async () => {
    
    // console.log('Content-Type: application/json\n');
    // console.log(process.env);

    console.log('Cache-Control: max-age=0, no-cache');
    if (!process.env.HTTP_AUTHORIZATION) {
        console.log('Status: 401 Unauthorized');
        console.log('WWW-Authenticate: Basic realm="admin"\n');
    }


    const adminAuthData = Buffer.from(process.env.HTTP_AUTHORIZATION, 'base64url').toString('utf-8').split(':');
    // console.log(adminAuthData);


    if (adminAuthData[0] === 'admin' && adminAuthData[1] === 'admin') {
        console.log('Content-Type: application/json\n');
        console.log('Yooo');
    } else {
        console.log('Status: 403 Forbidden\n');
    }
        
});