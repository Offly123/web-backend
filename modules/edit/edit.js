#!/usr/bin/env node
'use strict';


import * as querystring from 'querystring';
import 'dotenv/config';

import * as html from '../requires/templates.jss'
import * as cook from '../requires/cook.jss';
import { getLinkParams } from '../requires/httpdata.jss';
import { showDBError, connectToDB, DBDataToJSON, getSHA256 } from '../requires/hz.jss';



let postData;

process.stdin.on('data', (info) => {

    // Парсим данные из POST
    postData = querystring.parse(info.toString());

}).on('end', async () => {
try {
    
    // console.log('Content-Type: application/json\n'); 
    // console.log(process.env);
    
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


    // Парсим параметры из ссылки
    let path = process.env.QUERY_STRING.split('&');

    let params = {};
    path.forEach(elem => {
        params[elem.split('=')[0]] = elem.split('=')[1];
    });

    // Получаем данные пользователя из БД чтобы вставить 
    // в личный кабинет
    let sqlGetData = `
    SELECT 
        u.userId, userLogin, 
        fullName, phoneNumber, emailAddress, 
        birthDate,
        sex, biography
    FROM users u
    JOIN passwords p ON u.userId=p.userId
    WHERE u.userId = ?
    `;
    let sqlGetLanguages = `
    SELECT languageId from userLanguages
    WHERE userid = ?
    `;
    let data;
    try {
        let personalData = await con.execute(sqlGetData, [params.userId]);
        let languages = await con.execute(sqlGetLanguages, [params.userId]);
        data = DBDataToJSON(personalData, languages);
    } catch (err) {
        showDBError(con, err);
        return;
    }
    

    
    // HTML с задним фоном и профилем
    let base = html.getHTML('base.html');
    base = html.addBody(base, 'edit.html');
    base = html.addStyle(base, 'edit.html');


    // Если были данные были обновлены - добавляем попап
    let cookieList = cook.cookiesToJSON();
    if (cookieList.dataUpdated === 'true') {
        base = html.addBody(base, 'popup-update.html');
        base = html.addStyle(base, 'popup-update.html');
    }
    if (cookieList.dataSentFirstTime === 'true') {
        base = html.addBody(base, 'popup.html');
        base = html.addStyle(base, 'popup.html');
        cook.setCookie('dataSentFirstTime', '', -1);
    }
    
    
    // Добавляем к данным из БД куки с ошибками, чтобы подсветить
    data = Object.assign(data, cookieList); 
    
    // Если в POST ничего нет - возвращаем страницу
    if (!postData) {
        html.returnHTML(base, data);
        con.end();
        return;
    }
    

    // При наличии ошибок возвращает страницу, подсвечивая поля
    if (!cook.checkValues(postData)) {
        console.log('Location: /web-backend/6/edit/\n');
        con.end();
        return;
    }

    
    con.beginTransaction();
    
    
    
    let sqlUserData = `
    UPDATE users SET 
    fullName=?, phoneNumber=?, emailAddress=?, birthDate=?, sex=?, biography=? 
    WHERE userId = ?
    `;
    let sqlDeleteLanguages = `
    DELETE FROM userLanguages 
    WHERE userId = ?
    `;
    let sqlInsertLanguages = `
    INSERT IGNORE INTO userLanguages 
    (userId, languageId) 
    values (?, ?)
    `;
    let userData = [
        postData.fullName, postData.phoneNumber, postData.emailAddress, postData.birthDate, postData.sex, postData.biography, params.userId
    ];
    // Суём в массив если выбран только один язык, чтобы forEach заработал
    if (postData.language.constructor !== Array) {
        postData.language = [postData.language];
    }
    
    try {
        con.execute(sqlUserData, userData);
        con.execute(sqlDeleteLanguages, [params.userId]);
        postData.language.forEach(lang => {
            con.execute(sqlInsertLanguages, [params.userId, lang]);
        });
    } catch (err) {
        showDBError();
        return;
    }



    con.commit();
    con.end();


    
    cook.setCookie('dataUpdated', 'true');
    console.log(`Location: /web-backend/6/edit/?userId=${params.userId}\n`);
} catch (err) {
    con.end();
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
}
});