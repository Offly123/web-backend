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
const { showDBError } = require('./hz.jss');

process.stdin.on('data', async () => {

}).on('end', async () => {

    // console.log('Content-Type: application/json\n');

    // console.log('hehe');
    // Получает данные из ссылки и записывает в formData
    let requestURI = process.env.REQUEST_URI;
    let formData = url.parse(requestURI, true).query;


    cook.formDataToCookie(formData);

    
    // При наличии ошибок записывает их в куки
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
    const sqlUsers = `
        INSERT IGNORE INTO users 
            (fullName, phoneNumber, emailAddress, birthDate, sex, biography) 
        values (?, ?, ?, ?, ?, ?)
    `;
    const users = [
        formData.fullName, formData.phoneNumber, formData.emailAddress, formData.birthDate, formData.sex, formData.biography,
    ];
    let result;
    try {
        result = await con.execute(sqlUsers, users);
    } catch (err) {
        showDBError(con, err);
        return;
    }



    // Вставка выбранных языков в userLanguages
    let sqlUserLanguages = `
        INSERT IGNORE INTO userLanguages 
            (userId, languageId) 
        values (?, ?)
    `;
    let userId = result[0].insertId;

    // Если только один язык, всё равно суём его в массив, потому что forEach
    // иначе не заработает
    if (formData.language.constructor !== Array) {
        formData.language = [formData.language];
    }

    try {
        await formData.language.forEach(languageId => {
            let userLanguages = [userId, languageId];
            con.execute(sqlUserLanguages, userLanguages);
        });
    } catch (err) {
        showDBError(con, err);
        return;
    }



    // Вставка логина и пароля в passwords
    let login = cook.generateString(10);
    let password = cook.generateString(10);

    // Запись логина и пароля во временный файл, чтобы отобразить пользователю
    fs.writeFileSync('auth.txt', login + ';' + password);

    password = createHash('sha256').update(password).digest('base64');
    let sqlPasswords = `
        INSERT IGNORE INTO passwords 
            (userId, userLogin, userPassword) 
        values (?, ?, ?)
    `;
    let passwords = [
        userId, login, password
    ];

    try {
        await con.execute(sqlPasswords, passwords);
    } catch (err) {
        showDBError(con, err);
        return;
    }



    // Вставка случайного ключа для подписи JWT пользователя
    const sqlJwtKeys = `
        INSERT IGNORE INTO jwtKeys 
            (userId, jwtKey) 
        values (?, ?)
    `;
    const JWTInfo = {
        'userId': userId
    }
    const secret = cook.generateString(50);
    const jwt = myjwt.createJWT(JWTInfo, secret);
    const jwtKeys = [
        userId, secret
    ];

    try {
        await con.execute(sqlJwtKeys, jwtKeys);
    } catch (err) {
        showDBError(con, err);
        return;
    }
    cook.setCookie('session', jwt, 60 * 60 * 24 * 365);
    cook.setCookie('anyErrors', 'false');



    con.commit();
    con.end();



    console.log('Location: /web-backend/5\n');
});