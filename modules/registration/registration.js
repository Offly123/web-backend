'use strict';



// Скрипт, отвечающий за обработку регистрационных данных и 
// отображение страницы с формой регистрации.
//
// Если в введённых данных есть ошибки - возвращает страницу 
// и подсвечивает их. 
// Если ошибок нет - создаёт JWT, записывает его 
// в БД, добавляет в куки и перенаправляет на /profile/ .



const { createHash } = require('crypto');
require('dotenv/config');
const fs = require('fs');

const html = require('../requires/templates.js');
const cook = require('../requires/cook.js');
const myjwt = require('../requires/jwtlib.js');
const { getLinkParams } = require('../requires/httpdata.js');
const { showDBError, connectToDB } = require('../requires/hz.js');
const { error } = require('console');



let postData;

exports.GETregistration = async () =>{
try {
    
    // console.log('Content-Type: application/json\n');
    
    
    console.log('Cache-Control: max-age=0, no-cache, no-store');
    
    // HTML с задним фоном и регистрацией
    let base = html.getHTML('base.html');
    base = html.addBody(base, 'registration.html');
    base = html.addStyle(base, 'registration.html');

    const cookieList = cook.cookiesToJSON();
    if (cookieList.registrationErrors === 'true') {
        base = html.addBody(base, 'popup-badData.html');
        base = html.addStyle(base, 'popup-badData.html')
        cook.setCookie('registrationErrors', '', -1);
    }

    // Возвращаем регистрацию с подсвеченными полями (если есть)
    html.returnHTML(base, cookieList);
    
} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
    console.log(err);
}
}



exports.POSTregistration = async (postData) =>{
try {

    // console.log('Content-Type: application/json\n');
    // console.log(postData);
    

    
    // При наличии ошибок возвращает страницу, подсвечивая поля
    const errorList = cook.checkValues(postData);
    cook.formDataToCookie(postData);
    // console.log(errorList);
    if (errorList.length) {
        cook.setCookie('registrationErrors', 'true');
        if (postData.js === 'disabled') {
            console.log('Status: 301');
            console.log('Location: /web-backend/8/registration/\n');
            return;
        }
        console.log();
        console.log(JSON.stringify(errorList)); 
        
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
    cook.setCookie('login', login, 5);
    cook.setCookie('password', password, 5);
    


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
    cook.setCookie('dataSentFirstTime', 'true', 5);



    await con.commit();
    await con.end();


    cook.deleteRegistrationData();
    if (postData.js === 'disabled') {
        console.log('Status: 301');
        console.log('Location: /web-backend/8/profile/\n');
        return;
    }
    console.log();
    console.log(JSON.stringify(errorList));
} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
    console.log(err);
}
}
