#!/usr/bin/env node
'use strict';

const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config({
    path: "../../../.env"
});
const cook = require('./cgi/cook.jss');
const myjwt = require('./cgi/jsonlib.jss');
const html = require('./cgi/templates.jss');

process.stdin.on('data', () => {

}).on('end', async () => {

    // console.log('Content-Type: application/json\n');
    
    let base = html.getHTML('base.html');
    
    let isDataSended = cook.cookiesToJSON().dataSend;
    if (isDataSended === 'false') {
        cook.deleteRegistrationData();
        let popup = html.getHTML('popup.html');
        base = html.addTemplate(base, popup);
    }
    
    // console.log(process);
    
    let jwt = cook.cookiesToJSON().session;
    
    if (!jwt) {
        let forms = html.getHTML('forms.html');
        base = html.addTemplate(base, forms);
        html.returnHTML(base);
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
        let forms = html.getHTML('forms.html');
        base = html.addTemplate(base, forms);
        html.returnHTML(base);
        return;
    }
    
    let profile = html.getHTML('profile.html');
    base = html.addTemplate(base, profile);
    html.returnHTML(base);
});