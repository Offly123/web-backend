#!/usr/bin/env node
'use strict';



// Скрипт, отвечающий за обработку логина-пароля и 
// выдачу страницы с логином.
//
// Если данных в POST нет, выдаёт страницу. 
// Если есть - проверяет введённые данные с теми, что в БД. 
// Если неверный логин или пароль - сообщает пользователю. 
// Если всё верно - перенаправляет на /profile/.



const { createHash } = require('crypto');
const mysql = require('mysql2/promise');
const querystring = require('querystring');
require('dotenv').config({
    path: "../../../../.env"
});

const html = require('../requires/templates.jss')
const cook = require('../requires/cook.jss');
const myjwt = require('../requires/jwtlib.jss');
const { showDBError, connectToDB } = require('../requires/hz.jss');



let postData;

process.stdin
.on('data', (info) => {

    // Парсим данные из POST
    postData = querystring.parse(info.toString());

})
.on('end', async () => {
try {
    
    // console.log('Content-Type: application/json\n');
    // console.log(postData);
    

    console.log('Cache-Control: max-age=0, no-cache, no-store');


    // HTML с задним фоном и логином
    let base = html.getHTML('base.html');
    base = html.addTemplate(base, html.getHTML('login.html'));
    if (cook.cookiesToJSON().wrongLogin === 'true') {
        base = html.addTemplate(base, html.getHTML('popup-error.html'));
        cook.setCookie('wrongLogin', 'false');
    }


    // Если в POST ничего нет - возвращает страницу
    if (!postData) {
        html.returnHTML(base);
        return;
    }

    
    
    const con = await connectToDB();
    
    
    
    // Сравнение отправленного пароля с хэшем пароля в БД
    let userPassword;
    const sqlGetPassword = `
    SELECT userPassword FROM 
    passwords 
    WHERE userLogin = (?)
    `;
    
    try {
        userPassword = await con.execute(sqlGetPassword, [postData.login]);
    } catch (err) {
        showDBError();
        return;
    }
    
    const providedPassword = createHash('sha256').update(postData.password).digest('base64');
    
    // Если неверный логин или пароль - возвращем страницу с ошибкой
    if (!userPassword[0][0] || providedPassword != userPassword[0][0].userPassword) {

        con.end();

        cook.setCookie('wrongLogin', 'true');
        console.log('Location: /web-backend/6/?query=login\n');

        return;
    }

    // При правильном пароле берёт из БД ключ для этого пользователя
    // и записывает в куки его JWT на неделю
    let secret;
    let userId;

    const sqlGetKey = `
    SELECT jwtKey FROM (
        passwords JOIN jwtKeys ON passwords.userId = jwtKeys.userId
        ) 
        WHERE userLogin = (?)
    `;
    const sqlGetId = `
        SELECT userId FROM 
        passwords 
        where userLogin = (?)
    `;
    try {
        secret = await con.execute(sqlGetKey, [postData.login]);
        secret = secret[0][0].jwtKey;

        userId = await con.execute(sqlGetId, [postData.login]);
        userId = userId[0][0].userId;

    } catch (err) {
        showDBError();
        return;
    }

    const JWTInfo = {
        'userId': userId
    }
    const jwt = myjwt.createJWT(JWTInfo, secret);
    cook.setCookie('session', jwt, 60 * 60 * 24 * 7);



    con.commit();
    con.end();



    console.log('Location: /web-backend/6/profile\n');
} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log(err);
}
});