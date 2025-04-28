#!/usr/bin/env node
'use strict';


// Скрипт, отвечающий за отображение профиля 
// и обновление данных.
//
// Если нет JWT или JWT невалидный - 
// кидает на регистрацию, удаляя невалидный
//
// Если валидный JWT - читает его и вставляет
// в страницу данные пользователя из БД.
//
// Если данные, обновлённые пользователем, 
// кривые - подсвечивает поля, 
// иначе обновляет 
// их в БД



const querystring = require('querystring');
require('dotenv').config({
    path: "../../../../.env"
});

const html = require('../requires/templates.jss')
const cook = require('../requires/cook.jss');
const myjwt = require('../requires/jwtlib.jss');
const { getLinkParams } = require('../requires/httpdata.jss');
const { showDBError, connectToDB, DBDataToJSON } = require('../requires/hz.jss');



let postData;

process.stdin.on('data', (info) => {

    // Парсим данные из POST
    postData = querystring.parse(info.toString());

}).on('end', async () => {
try {
    
    // console.log('Content-Type: application/json\n');
    // console.log(postData);

    console.log('Cache-Control: max-age=0, no-cache, no-store');
    cook.deleteRegistrationData();


    // Если нет JWT - перенаправляем на регистрацию
    const jwt = cook.cookiesToJSON().session;
    if (!jwt) {
        console.log('Location: /web-backend/6/registration\n');
        return;
    }


    
    // Расшифровываем JWT и получаем userId
    let decoded = myjwt.decodeJWT(jwt);
    let userId;
    // Если JWT кривой - ставим айди пользователя -1
    if (decoded) {
        userId = decoded[1].userId;
    } else {
        userId = -1;
    }


    
    let con = await connectToDB();



    // Если есть валидный JWT - возвращаем личный кабинет, 
    // иначе перенаправляем на логин
    const sqlGetSecret = `
    SELECT jwtKey FROM 
    jwtKeys 
    where userId = (?)
    `;
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

        con.end();

        cook.setCookie('session', '', -1);
        console.log('Location: /web-backend/6/\n');

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
    

    
    // HTML с задним фоном и профилем
    let base = html.getHTML('base.html');
    base = html.addBody(base, 'profile.html');
    base = html.addStyle(base, 'profile.html');


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
        console.log('Location: /web-backend/6/?query=profile\n');
        con.end();
        return;
    }


    
    con.beginTransaction();

    
    
    // Берёт из JWT userId и обновляет данные в users
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
        postData.fullName, postData.phoneNumber, postData.emailAddress, postData.birthDate, postData.sex, postData.biography, userId
    ];
    // Суём в массив если выбран только один язык, чтобы forEach заработал
    if (postData.language.constructor !== Array) {
        postData.language = [postData.language];
    }
    
    try {
        con.execute(sqlUserData, userData);
        con.execute(sqlDeleteLanguages, [userId]);
        postData.language.forEach(lang => {
            con.execute(sqlInsertLanguages, [userId, lang]);
        });
    } catch (err) {
        showDBError();
        return;
    }



    con.commit();
    con.end();


    
    cook.setCookie('dataUpdated', 'true');
    console.log('Location: /web-backend/6/?query=profile\n');
} catch (err) {
    con.end();
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
}
});