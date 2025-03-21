#!/usr/bin/env node
'use strict';

const { createHash } = require('crypto');
const mysql = require('mysql2/promise');
const url = require('url');
const fs = require('fs');
require('dotenv').config({
    path: "../../../../.env"
});
const cook = require('./cook.jss');
const myjwt = require('./jwtlib.jss');
const { showError } = require('./hz.jss');

process.stdin.on('data', async () => {

}).on('end', async () => {

    // console.log('Content-Type: application/json\n');

    // Получает данные из ссылки и записывает в formData
    let requestURI = process.env.REQUEST_URI;
    let formData = url.parse(requestURI, true).query;


    cook.formDataToCookie(formData);


    // При наличии ошибок подсвечивает их
    if (!cook.checkValues(formData)) {
        console.log('Location: /web-backend/5\n');
        // console.log('Content-Type: application/json\n');
        // console.log('inside if');
        return;
    }


    const con = await mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPSWD,
        database: process.env.DBNAME
    });
    con.beginTransaction();



    // Вставка основных данных пользователя в users
    const sql_users = `
        INSERT IGNORE INTO users 
            (fullName, phoneNumber, emailAddress, birthDate, sex, biography) 
        values (?, ?, ?, ?, ?, ?)
    `;
    const users = [
        formData.fullName, formData.phoneNumber, formData.emailAddress, formData.birthDate, formData.sex, formData.biography,
    ];
    let result;
    try {
        result = await con.execute(sql_users, users);
    } catch (err) {
        showError(con, err);
        return;
    }



    // Вставка выбранных языков в user_languages
    let sql_user_languages = `
        INSERT IGNORE INTO user_languages 
            (userId, languageId) 
        values (?, ?)
    `;
    let user_id = result[0].insertId;

    // Если только один язык, всё равно суём его в массив, потому что forEach
    // иначе не заработает
    if (formData.language.constructor !== Array) {
        formData.language = [formData.language];
    }

    try {
        await formData.language.forEach(language_id => {
            let user_languages = [user_id, language_id];
            con.execute(sql_user_languages, user_languages);
        });
    } catch (err) {
        showError(con, err);
        return;
    }



    // Вставка логина и пароля в passwords
    let login = cook.generateString(10);
    let password = cook.generateString(10);

    // Запись логина и пароля во временный файл, чтобы отобразить пользователю
    fs.writeFileSync('auth.txt', login + ';' + password);

    password = createHash('sha256').update(password).digest('base64');
    let sql_passwords = `
        INSERT IGNORE INTO passwords 
            (userId, userLogin, userPassword) 
        values (?, ?, ?)
    `;
    let passwords = [
        user_id, login, password
    ];

    try {
        await con.execute(sql_passwords, passwords);
    } catch (err) {
        showError(con, err);
        return;
    }



    // Вставка случайного ключа для подписи JWT пользователя
    const sql_jwt_keys = `
        INSERT IGNORE INTO jwt_keys 
            (userId, jwtKey) 
        values (?, ?)
    `;
    const JWTInfo = {
        'user_id': user_id
    }
    const secret = cook.generateString(50);
    const jwt = myjwt.createJWT(JWTInfo, secret);
    const jwt_keys = [
        user_id, secret
    ];

    try {
        await con.execute(sql_jwt_keys, jwt_keys);
    } catch (err) {
        showError(con, err);
        return;
    }
    cook.setCookie('session', jwt, 60 * 60 * 24 * 365);



    con.commit();
    con.end();



    console.log('Location: /web-backend/5\n');
});