#!/usr/bin/env node
'use strict';


const mysql = require('mysql2/promise');
const querystring = require('querystring');
require('dotenv').config({
    path: "../../../../.env"
});
const fs = require('fs');
const cook = require('./cook.jss');
const myjwt = require('./jwtlib.jss');
const { showDBError } = require('./hz.jss');


let body = '';
process.stdin.on('data', (chunk) => {

    body += chunk.toString();
    
}).on('end', async () => {
    console.log('Status: 401 Unauthorized');
    console.log('WWW-Authenticate: Basic realm="MyRealm"');
    console.log('Cache-Control: max-age=0, no-cache');
    fs.writeFileSync('hehe.txt', process);
    
    // console.log('Location: /web-backend/6\n');
    console.log('Content-Type: application/json\n');

    console.log(process);
});