#!/usr/bin/env node
'use strict';



const querystring = require('querystring');
require('dotenv').config({
    path: "../../../../.env"
});

const html = require('../requires/templates.js')
const cook = require('../requires/cook.js');
const { getLinkParams } = require('../requires/httpdata.js');
const { showDBError, connectToDB, DBDataToJSON, getSHA256 } = require('../requires/hz.js');



let postData;

exports.GETedit = async () => {
try {
    
    // console.log('Content-Type: application/json\n'); 
    // console.log(''); 
    // console.log(process.env);
    
    // Если через HTTP не отправлены логин/пароль - кидаем HTTP авторизацию
    console.log('Cache-Control: max-age=0, no-cache');
    if (!process.env.HTTP_AUTHORIZATION) {
        console.log('Status: 401 Unauthorized');
        console.log('WWW-Authenticate: Basic realm="admin"\n');
        return;
    }
    
    
    
    let con = await connectToDB();
    
    
    
    const adminAuthData = Buffer.from(process.env.HTTP_AUTHORIZATION, 'base64url').toString('utf-8').split(':');
    let sqlAdminPassword = `
    SELECT adminPassword FROM adminPasswords
    WHERE adminLogin = ?
    `;
    let adminPassword;
    try {
        adminPassword = await con.execute(sqlAdminPassword, [adminAuthData[0]]);
        adminPassword = adminPassword[0][0].adminPassword;
    } catch (err) {
        showDBError(con, err);
        return;
    }



    // Если неправильный логин или пароль - кидаем 403
    if (getSHA256(adminAuthData[1]) !== adminPassword) {
        console.log('Status: 403 Forbidden\n');
        return;
    }



    // Парсим параметры из ссылки
    let path = process.env.REQUEST_URI.split('?')[1].split('&');

    let params = {};
    path.forEach(elem => {
        // console.log(params);
        params[elem.split('=')[0]] = elem.split('=')[1];
    });
    // console.log(params);

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
        let promises = [];
        promises = [ ...promises, con.execute(sqlGetData, [params.userId]) ];
        promises = [ ...promises, con.execute(sqlGetLanguages, [params.userId]) ];
        const [ personalData, languages ] = await Promise.all(promises); 
        data = DBDataToJSON(personalData, languages);
    } catch (err) {
        showDBError(con, err);
        console.log(process.env.QUERY_STRING);
        return;
    }



    con.end();
    

    
    // HTML с задним фоном и профилем
    let base = html.getHTML('base.html');
    base = html.addBody(base, 'edit.html');
    base = html.addStyle(base, 'edit.html');


    // Если были данные были обновлены - добавляем попап
    let cookieList = cook.cookiesToJSON();
    if (cookieList.dataUpdated === 'true') {
        base = html.addBody(base, 'popup-update.html');
        base = html.addStyle(base, 'popup-update.html');
        cook.setCookie('dataUpdated', '', -1);
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
    
} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
    console.log(err);
}
};

exports.POSTedit = async (postData) => {
try{

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
    


    const con = await connectToDB();

    
    
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


    // При наличии ошибок возвращает страницу, подсвечивая поля
    if (!cook.checkValues(postData)) {
        console.log('Location: /web-backend/8/edit/\n');
        con.end();
        return;
    }
    
        
    con.beginTransaction();
        
        

    // Парсим параметры из ссылки
    let path = process.env.QUERY_STRING.split('&');

    let params = {};
    path.forEach(elem => {
        params[elem.split('=')[0]] = elem.split('=')[1];
    });
        
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
        let promises = [];
        promises = [...promises, con.execute(sqlUserData, userData)];
        promises = [...promises, con.execute(sqlDeleteLanguages, [params.userId])];
        postData.language.forEach(lang => {
            promises = [...promises, con.execute(sqlInsertLanguages, [params.userId, lang])];
        });
        await Promise.all(promises);
    } catch (err) {
        showDBError();
        return;
    }



    con.commit();
    con.end();


    
    cook.setCookie('dataUpdated', 'true');
    console.log(`Location: /web-backend/8/edit/?userId=${params.userId}\n`);
} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
    console.log(err);
}
}