#!/usr/bin/env node
'use strict';

const { createHash } = require('crypto');
const querystring = require('querystring');
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({
    path: "../../../../.env"
});
const cook = require('./cgi/cook.jss');
const myjwt = require('./cgi/jwtlib.jss');
const { showDBError, connectToDB } = require('./cgi/hz.jss');

let body = '';
process.stdin.on('data', (chunk) => {
    body += chunk.toString();
}).on('end', async () => {
    
    // console.log('Content-Type: application/json\n');
    
    let formData = querystring.parse(body);


    cook.formDataToCookie(formData);

    
    // При наличии ошибок записывает их в куки
    if (!cook.checkValues(formData)) {
        console.log('Location: /web-backend/6\n');
        // console.log('Content-Type: application/json\n');
        // console.log('inside if');
        return;
    }


    const con = await connectToDB();
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
    try {
        fs.writeFileSync('../../../../auth.txt', login + ';' + password);
    } catch (err) {
        console.log('Content-Type: text/hmtl\n');
        console.log(err);
    }

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
    cook.setCookie('dataSentFirstTime', 'true');



    await con.commit();
    await con.end();



    console.log('Location: /web-backend/6\n');
});