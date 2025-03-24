#!/usr/bin/env node
'use strict';


const { createHash } = require('crypto');
const mysql = require('mysql2/promise');
const url = require('url');
require('dotenv').config({
    path: "../../../../.env"
});
const cook = require('./cook.jss');
const myjwt = require('./jwtlib.jss');
const { showDBError } = require('./hz.jss');


process.stdin.on('data', () => {

}).on('end', async () => {

    // console.log('Content-Type: application/json\n');

    // Берём данные из ссылки и записываем в formData
    let requestURI = process.env.REQUEST_URI;
    let formData = url.parse(requestURI, true).query;


    const con = await mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPSWD,
        database: process.env.DBNAME
    });
    con.beginTransaction();



    // Сравнение отправленного пароля с хэшем пароля в БД
    let userPassword;
    const sqlGetPassword = `
        SELECT userPassword FROM 
            passwords 
        WHERE userLogin = (?)
    `;

    try {
        userPassword = await con.execute(sqlGetPassword, [formData.login]);
    } catch (err) {
        showDBError();
        return;
    }

    const providedPassword = createHash('sha256').update(formData.password).digest('base64');
    if (!userPassword[0][0] || providedPassword != userPassword[0][0].userPassword) {
        con.rollback();
        con.end();
        cook.setCookie('wrongLogin', 'true', 1);
        console.log('Cache-Control: max-age=0, no-cache');
        console.log('Location: /web-backend/5\n');
        return;
    }


    // При правильном пароле берёт из БД ключ для этого пользователя
    // и записывает в куки его JWT на год
    let secret;
    let userId;

    const sqlGetKey = `
    SELECT jwtKey FROM (
        passwords JOIN jwtKeys ON passwords.userId = jwtKeys.userId
        ) 
        WHERE userLogin = (?)
    `;
    const sqlGetId = `
        SELECT userId FROM 
        passwords 
        where userLogin = (?)
    `;
    try {
        secret = await con.execute(sqlGetKey, [formData.login]);
        secret = secret[0][0].jwtKey;

        userId = await con.execute(sqlGetId, [formData.login]);
        userId = userId[0][0].userId;

    } catch (err) {
        showDBError();
        return;
    }

    const JWTInfo = {
        'userId': userId
    }
    const jwt = myjwt.createJWT(JWTInfo, secret);
    cook.setCookie('session', jwt, 60 * 60 * 24 * 365);



    con.commit();
    con.end();



    console.log('Cache-Control: max-age=0, no-cache');
    console.log('Location: /web-backend/5\n');
});