#!/usr/bin/env node
'use strict';



// Скрипт, отвечающий за обработку регистрационных данных и 
// отображение страницы с формой регистрации.
//
// Если в введённых данных есть ошибки - возвращает страницу 
// и подсвечивает их. 
// Если ошибок нет - создаёт JWT, записывает его 
// в БД, добавляет в куки и перенаправляет на /profile/ .



const { createHash } = require('crypto');
const querystring = require('querystring');
require('dotenv').config({
    path: "../../../../.env"
});
const fs = require('fs');

const html = require('../requires/templates.jss')
const cook = require('../requires/cook.jss');
const myjwt = require('../requires/jwtlib.jss');
const { getLinkParams } = require('../requires/httpdata.jss');
const { showDBError, connectToDB } = require('../requires/hz.jss');



let postData;

process.stdin.on('data', (info) => {

    // Парсим данные из POST
    postData = querystring.parse(info.toString());
    
}).on('end', async () => {
try {
    
    // console.log('Content-Type: application/json\n');
    // console.log(process);  
    // console.log(postData);
    
    
    console.log('Cache-Control: max-age=0, no-cache, no-store');
    
    
    // HTML с задним фоном и регистрацией
    let base = html.getHTML('base.html');
    base = html.addBody(base, 'registration.html');
    base = html.addStyle(base, 'registration.html');
    
    
    // Если в POST ничего нет - возвращает страницу
    let cookieList = cook.cookiesToJSON();
    cook.formDataToCookie(postData);
    if (!postData) {
        base = cook.cookiesInPage(base, cookieList);
        html.returnHTML(base);
        return;
    }
    
    
    
    // При наличии ошибок возвращает страницу, подсвечивая поля
    if (!cook.checkValues(postData)) {
        console.log('Location: /web-backend/6/?query=registration\n');
        
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
        postData.fullName, postData.phoneNumber, postData.emailAddress, postData.birthDate, postData.sex, postData.biography,
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
    if (postData.language.constructor !== Array) {
        postData.language = [postData.language];
    }

    try {
        await postData.language.forEach(languageId => {
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
        fs.writeFileSync('../auth.txt', login + ';' + password);
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
    const jwt = myjwt.createJWT(JWTInfo, secret, 60 * 60 * 24 * 7);
    const jwtKeys = [
        userId, secret
    ];

    try {
        await con.execute(sqlJwtKeys, jwtKeys);
    } catch (err) {
        showDBError(con, err);
        return;
    }
    cook.setCookie('session', jwt, 60 * 60 * 24 * 7);
    cook.setCookie('dataSentFirstTime', 'true');



    await con.commit();
    await con.end();


    cook.deleteRegistrationData();
    console.log('Location: /web-backend/6?query=profile\n');
} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
}
});