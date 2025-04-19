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
const { showDBError, connectToDB, getSHA256 } = require('../cgi/hz.jss');



process.stdin.on('data', () => {
    
}).on('end', async () => {
    
    // console.log('Content-Type: application/json\n');
    
    
    console.log('Cache-Control: max-age=0, no-cache');
    if (!process.env.HTTP_AUTHORIZATION) {
        console.log('Status: 401 Unauthorized');
        console.log('WWW-Authenticate: Basic realm="admin"\n');
    }


    const adminAuthData = Buffer.from(process.env.HTTP_AUTHORIZATION, 'base64url').toString('utf-8').split(':');
    
    let sqlAdminPassword = `
    SELECT adminPassword FROM adminPasswords
    WHERE adminLogin = ?
    `;

    let con = await connectToDB();

    let adminPassword;
    try {
        adminPassword = await con.execute(sqlAdminPassword, [adminAuthData[0]]);
        adminPassword = adminPassword[0][0].adminPassword;
    } catch (err) {
        console.log('Content-Type: application/json\n');
        console.log(err);
    }

    con.end();


    
    if (getSHA256(adminAuthData[1]) !== adminPassword) {
        console.log('Status: 403 Forbidden\n');
        return;
    }


    let base = html.getHTML('base.html');
    base = html.addTemplate(base, html.getHTML('admin.html'));

    html.returnHTML(base);
});