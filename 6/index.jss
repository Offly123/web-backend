#!/usr/bin/env node
'use strict';


const mysql = require('mysql2/promise');
const url = require('url')
const querystring = require('querystring');


require('dotenv').config({
    path: "../../../../.env"
});


const cook = require('../cgi/cook.jss');
const myjwt = require('../cgi/jwtlib.jss');
const html = require('../cgi/templates.jss');
const { showDBError, DBDataToJSON, connectToDB } = require('../cgi/hz.jss');

let postData;
process.stdin.on('data', (info) => {

    postData = querystring.parse(info.toString());

}).on('end', async () => {
        
    console.log('Content-Type: application/json\n');
    console.log(postData);

    // TODO: короче надо либо разделить логин регистрацию, но тогда анимации гадем,
    // либо оставить как было и разделить только профиль и админку
    // либо запихать логин регистрацию в index.jss но это вообще гадемище

    // Получение значения query из ссылки и перенаправление, если оно есть
    let path = process.env.REQUEST_URI.split('?');
    if (path[1]) {
        path[1].split('&');
    }    
    
    let params = {};
    path.forEach(elem => {
        params[elem.split('=')[0]] = elem.split('=')[1];
    });
    
    // Перенаправление на /admin
    if (params.query && params.query === 'admin') {
        console.log('Location: /web-backend/6/admin\n');
        return;
    }
    
    const jwt = cook.cookiesToJSON().session;
    const anyErrors = cook.cookiesToJSON().anyErrors;
    const dataSentFirstTime = cook.cookiesToJSON().dataSentFirstTime;

    if (params.query && params.query === 'profile') {
        console.log('Location: /web-backend/6/profile\n');
        return;
    }

    
    
    // HTML с задним фоном
    let base = html.getHTML('base.html');
    base = html.addTemplate(base, html.getHTML('forms.html'));
    html.returnHTML(base);
    console.log(postData);
    
    if (anyErrors === 'false' && dataSentFirstTime === 'true') {
        cook.deleteRegistrationData();
        base = html.addTemplate(base, html.getHTML('popup.html'));
    }
    
    
    // Если неправильный логин/пароль добавляем окно с ошибкой
    let wrongLogin = cook.cookiesToJSON().wrongLogin;
    if (wrongLogin === 'true') {
        base = html.addTemplate(base, html.getHTML('popup-error.html'));
    }
    
    
    // Если отсутствует JWT - возвращает HTML в формами
    if (!jwt) {
        base = html.addTemplate(base, html.getHTML('forms.html'));
        let data = cook.cookiesToJSON();
        html.returnHTML(base, data);
        return;
    }
    
    
    let decoded = myjwt.decodeJWT(jwt);
    
    
    const con = await connectToDB();
    con.beginTransaction();
    
    
    
    // Если есть валидный JWT - возвращаем личный кабинет, 
    // иначе логин и регистрацию
    const sqlGetSecret = `
    SELECT jwtKey FROM 
    jwtKeys 
    where userId = (?)
    `;
    let userId = decoded[1].userId;
    let secret;
    
    try {
        secret = await con.execute(sqlGetSecret, [userId]);
    } catch (err) {
        showDBError(con, err);
        return;
    }
    
    // Если JWT не валидный - удаляем его и возвращаем 
    // HTML с формами
    if (secret[0][0] == undefined || !myjwt.isValideJWT(decoded, secret[0][0].jwtKey)) {
        cook.setCookie('session', '', -1);
        con.rollback();
        con.end();
        base = html.addTemplate(base, html.getHTML('forms.html'));
        let data = cook.cookiesToJSON();
        html.returnHTML(base);
        return;
    }



    // Получаем данные пользователя из БД чтобы вставить 
    // в личный кабинет
    let sqlGetData = `
    SELECT * from users
    WHERE userId = ?
    `;
    let sqlGetLanguages = `
    SELECT languageId from userLanguages
    WHERE userid = ?
    `;
    let data;
    try {
        let personalData = await con.execute(sqlGetData, [userId]);
        let languages = await con.execute(sqlGetLanguages, [userId]);
        data = DBDataToJSON(personalData, languages);
    } catch (err) {
        showDBError(con, err);
        return;
    }



    con.commit();
    con.end();



    // Если валидный JWT - возвращаем личный кабинет
    // console.log(data);
    cook.setCookie('dataSentFirstTime', '', -1);
    cook.deleteRegistrationData();
    base = html.addTemplate(base, html.getHTML('profile.html'));
    html.returnHTML(base, data);
});