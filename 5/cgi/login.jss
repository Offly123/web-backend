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
const { showError } = require('./hz.jss');


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
    const sql_get_password = `
        SELECT userPassword FROM 
            passwords 
        WHERE userLogin = (?)
    `;

    try {
        userPassword = await con.execute(sql_get_password, [formData.login]);
    } catch (err) {
        showError();
        return;
    }

    const providedPassword = createHash('sha256').update(formData.password).digest('base64');
    if (!userPassword[0][0] || providedPassword != userPassword[0][0].userPassword) {
        console.log('Content-Type: application/json\n');
        console.log('Неверный логин или пароль\n');
        console.log('Вообще тут надо вернуть назад и подсветить поля красным но это потом');
        // con.rollback();
        con.end();
        return;
    }


    // При правильном пароле берёт из БД ключ для этого пользователя
    // и записывает в куки его JWT на год
    let secret;
    let user_id;

    const sql_get_key = `
    SELECT jwtKey FROM (
        passwords JOIN jwt_keys ON passwords.userId = jwt_keys.userId
        ) 
        WHERE userLogin = (?)
    `;
    const sql_get_id = `
        SELECT userId FROM 
        passwords 
        where userLogin = (?)
    `;
    try {
        secret = await con.execute(sql_get_key, [formData.login]);
        secret = secret[0][0].jwtKey;

        user_id = await con.execute(sql_get_id, [formData.login]);
        user_id = user_id[0][0].userId;

    } catch (err) {
        showError();
        return;
    }

    const JWTInfo = {
        'userId': user_id
    }
    const jwt = myjwt.createJWT(JWTInfo, secret);
    cook.setCookie('session', jwt, 60 * 60 * 24 * 365);



    con.commit();
    con.end();



    console.log('Cache-Control: max-age=0, no-cache');
    console.log('Location: /web-backend/5\n');
});