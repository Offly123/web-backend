#!/usr/bin/env node
'use strict';

const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config({
    path: "../../../.env"
});
const cook = require('./cgi/cook.jss');
const myjwt = require('./cgi/jsonlib.jss');

process.stdin.on('data', () => {

}).on('end', async () => {

    // console.log('Content-Type: application/json\n');
    let page;
    try {
        page = fs.readFileSync('/home/u68757/www/web-backend/5/html-templates/page.html', 'utf8');
    } catch (err) {
        console.log('Content-Type: application/json; charset=utf-8\n');
        console.log('Файл page.html не найден');
        return;
    }
    page = cook.cookiesInPage(page);
    let cookies = cook.cookiesToJSON().dataSend;
    if (cookies) {
        cook.deleteRegistrationData();
    }
    
    console.log('Content-Type: text/html; charset=utf-8\n');
    // console.log(page);
    
    // console.log(process);
    
    let jwt = cook.cookiesToJSON().session;
    
    if (!jwt) {
        page = cook.deleteHTMLFlags(page);
        console.log(page);
        return;
    }
    let decoded = myjwt.decodeJWT(jwt);
    
    
    const con = await mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPSWD,
        database: process.env.DBNAME
    });
    let successAuth = false;
    try {
        

        let sql_get_secret = 'SELECT jwt_key FROM jwt_keys WHERE user_id=(?)';
        let user_id = JSON.parse(decoded[1]).user_id;
        user_id = [user_id];
        let secret = await con.execute(sql_get_secret, user_id);
        secret = secret[0][0].jwt_key;

        if (!myjwt.isValideJWT(decoded, secret)) {
            console.log('Ошибка при аутентификации');
            return;
        }
        successAuth = true;
        

    } catch (err) {
        console.log('Ошибка в ДБ');
        console.log(err);
    } finally {
        con.end();
    }

    if (!successAuth) {
        console.log(page);
        return;
    }
    
    page = cook.deleteHTMLFlags(page);
    console.log(page);
});