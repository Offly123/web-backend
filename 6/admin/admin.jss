#!/usr/bin/env node
'use strict';


// Скрипт, отвечающий за отображение админки
//
// Сначала кидает HTTP авторизацию:
//      Если логин/пароль кривые - кидаем 401 Unauthorized
//
// Если всё ок - делаем запросы в БД, получаем статистику 
// по языкам и все логины пользователей
//
// Вставляем языки в таблицу и выводим пользователей
// Если нажали на изменение данных
// Хз ещё, либо перезагружаем страницу с ?query=userId, потом вставляя данные пользователя
//         либо на фронте джаваскриптом заменить список пользователей 
//              на данные одного выбранного




const mysql = require('mysql2/promise');
const querystring = require('querystring');
require('dotenv').config({
    path: "../../../../.env"
});
const html = require('../requires/templates.jss');
const cook = require('../requires/cook.jss');
const myjwt = require('../requires/jwtlib.jss');
const { showDBError, connectToDB, getSHA256 } = require('../requires/hz.jss');



process.stdin.on('data', () => {
    
}).on('end', async () => {
    
    // console.log('Content-Type: application/json\n');
    
    
    // Если через HTTP не отправлены логин/пароль - кидаем HTTP авторизацию
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
        showDBError(con, err);
        return;
    }


    
    // Если неправильный логин пароль - кидаем 403
    if (getSHA256(adminAuthData[1]) !== adminPassword) {
        con.end();
        console.log('Status: 403 Forbidden\n');
        return;
    }



    // Получаем логины пользователей и статистику языков
    let sqlUsersInfo = `
    SELECT users.userId, userLogin, fullName, phoneNumber, emailAddress, birthDate, sex, biography FROM (
    users JOIN passwords ON users.userId = passwords.userId 
    );`
    let sqlLanguageInfo = `
    SELECT COUNT(userId) as languageCount, languageName FROM 
    (userLanguages JOIN languages ON userLanguages.languageId = languages.languageId)
    GROUP BY userLanguages.languageId
    ORDER BY COUNT(userId) DESC;
    `;
    let languageInfo;
    let usersInfo;
    try {
        usersInfo    = await con.execute(sqlUsersInfo);
        usersInfo    = usersInfo[0];

        languageInfo = await con.execute(sqlLanguageInfo);
        languageInfo = languageInfo[0];
    } catch (err) {
        showDBError(con, err);
        console.log(err);
    }


    
    con.end();



    // Добавляем страницу админки
    let base = html.getHTML('base.html');
    base = html.addBody(base, 'admin.html');
    base = html.addStyle(base, 'admin.html');
    
    // Добавляем пользователей
    usersInfo.forEach(user => {
        let users = html.getHTML('users.html');
        users = html.insertData(users, user);
        base = html.addInsteadOf(base, users, '$users$')
    }); 
    base = html.addStyle(base, 'users.html');

    // Добавляем список языков
    languageInfo.forEach(language => {
        let languages = html.getHTML('language.html');
        languages = html.insertData(languages, language);
        base = html.addInsteadOf(base, languages, '$languageList$');
    });
    base = html.addStyle(base, 'language.html');
    
    html.returnHTML(base);
});