#!/usr/bin/env node
'use strict';

const mysql = require('mysql2/promise');
require('dotenv').config({
    path: "../../../.env"
});
const cook = require('./cgi/cook.jss');
const myjwt = require('./cgi/jwtlib.jss');
const html = require('./cgi/templates.jss');
const { showDBError, DBDataToJSON } = require('./cgi/hz.jss');

process.stdin.on('data', () => {

}).on('end', async () => {

    // console.log('Content-Type: application/json\n');

    // HTML с задним фоном
    let base = html.getHTML('base.html');
    
    const jwt = cook.cookiesToJSON().session;
    const anyErrors = cook.cookiesToJSON().anyErrors;
    const dataSentFirstTime = cook.cookiesToJSON().dataSentFirstTime;
    
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
    
    
    const con = await mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPSWD,
        database: process.env.DBNAME
    });
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