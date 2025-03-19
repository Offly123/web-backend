#!/usr/bin/env node
'use strict';


const { createHash } = require('crypto');
const mysql = require('mysql2/promise');
const url = require('url');
require('dotenv').config({
    path: "../../../../.env"
});
const cook = require('./cook.jss');
const myjwt = require('./jsonlib.jss');


process.stdin.on('data', () => {

}).on('end', async () => {

    // console.log('Content-Type: application/json\n');

    let requestURI = process.env.REQUEST_URI;
    let formData = url.parse(requestURI, true).query;

    const con = await mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPSWD,
        database: process.env.DBNAME
    });

    try {


        const sql_get_password = 'SELECT user_password FROM passwords where user_login = (?)';
        const userPassword = await con.execute(sql_get_password, [formData.login]);

        const providedPassword = createHash('sha256').update(formData.password).digest('base64');
        if (!userPassword[0][0] || providedPassword != userPassword[0][0].user_password) {
            console.log('Content-Type: application/json\n');
            console.log('Неверный логин или пароль');
            return;
        }



        const sql_get_key = 'SELECT jwt_key FROM (passwords JOIN jwt_keys ON passwords.user_id = jwt_keys.user_id) WHERE user_login = (?)'
        const secret = await con.execute(sql_get_key, [formData.login]);

        const sql_get_id = 'SELECT user_id FROM passwords WHERE user_login = (?)';
        const user_id = await con.execute(sql_get_id, [formData.login]);

        const JWTInfo = {
            'user_id': user_id[0][0].user_id
        }
        const jwt = myjwt.createJWT(JWTInfo, secret[0][0].jwt_key);
        cook.setCookie('session', jwt, 60 * 60 * 24 * 365);
        console.log('Location: /web-backend/5\n');
    } catch (err) {
        console.log('Content-Type: application/json\n');
        console.log('Ошибка в ДБ');
        console.log(err);
    } finally {
        con.end();
    }
});