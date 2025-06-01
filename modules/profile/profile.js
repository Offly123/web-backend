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

const html = require('../requires/templates.js')
const cook = require('../requires/cook.js');
const myjwt = require('../requires/jwtlib.js');
const { getLinkParams } = require('../requires/httpdata.js');
const { showDBError, connectToDB, DBDataToJSON } = require('../requires/hz.js');



exports.GETprofile = async () => {
let con;
try {
    con = await connectToDB();
} catch (err) {
    showDBError(con, err);
    return;
}
try{

    // console.log('Content-Type: application/json\n');
    // console.log(process.env);
    const cookieList = cook.cookiesToJSON();
    cook.deleteRegistrationData();

    // HTML с задним фоном и профилем
    let base = html.getHTML('base.html');
    
    // Если нет JWT - перенаправляем на регистрацию
    const jwt = cookieList.session;
    if (!jwt) {
        con.end();

        base = html.addBody(base, 'notAuthorized.html');
        html.returnHTML(base);

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

        base = html.addBody(base, 'notAuthorized.html');
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
        const [personalData, languages] = await Promise.all([
            con.execute(sqlGetData, [userId]),
            con.execute(sqlGetLanguages, [userId])
        ]);
        data = DBDataToJSON(personalData, languages);
    } catch (err) {
        showDBError(con, err);
        return;
    }
    
    

    con.end();



    base = html.addBody(base, 'profile.html');
    base = html.addStyle(base, 'profile.html');
    
    

    // console.log(cookieList);
    if (cookieList.dataUpdated === 'true') {
        cook.setCookie('dataUpdated', '', -1);
        base = html.addBody(base, 'popup-update.html');
        base = html.addStyle(base, 'popup-update.html');
    }
    if (cookieList.updateError === 'true') {
        base = html.addBody(base, 'popup-badData.html');
        base = html.addStyle(base, 'popup-badData.html');
        cook.setCookie('updateError', 'false');
    }
    if (cookieList.dataSentFirstTime === 'true') {
        base = html.addBody(base, 'popup.html');
        base = html.addStyle(base, 'popup.html');
        cook.setCookie('dataSentFirstTime', '', -1);
        cook.setCookie('login', '', -1);
        cook.setCookie('password', '', -1);
    }
    
    

    
    let sessionJWT = myjwt.createJWT(
        { userId: userId },
        process.env.JWTKEY,
        60 * 10
    );
    html.returnHTML(base, {...data, jwt: sessionJWT, ...cookieList});
} catch(err) {
    con.end();
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
    console.log(err);
}
}


exports.POSTprofile = async (postData) => {
let con;
try {
    con = await connectToDB();
} catch (err) {
    showDBError(con, err);
    return;
}
try {
    
    // console.log('Content-Type: application/json\n');
    // console.log(postData);

    console.log('Cache-Control: max-age=0, no-cache, no-store');

    // Если нет JWT - перенаправляем на регистрацию
    const jwt = cook.cookiesToJSON().session;
    if (!jwt) {
        await con.end();
        console.log('Status: 301');
        console.log('Location: /web-backend/8/profile\n');
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



    // Получаем секретный ключ пользователя из БД
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
    


    // Если JWT не валидный - удаляем его и 
    // возвращаем на главную
    if (secret[0][0] == undefined || !myjwt.isValideJWT(decoded, secret[0][0].jwtKey)) {

        con.end();

        cook.setCookie('session', '', -1);
        console.log('Status: 301');
        console.log('Location: /web-backend/8/\n');

        return;
    }
    const decodedSessionJWT = myjwt.decodeJWT(postData.jwt);
    if (!myjwt.isValideJWT(decodedSessionJWT, process.env.JWTKEY)) {
        con.end();

        cook.setCookie('session', '', -1);
        console.log('Status: 301');
        console.log('Location: /web-backend/8/\n');

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
    
    

    // Добавляем к данным из БД куки с ошибками, чтобы подсветить
    let cookieList = cook.cookiesToJSON();
    data = Object.assign(data, cookieList); 

    

    // При наличии ошибок возвращает страницу, подсвечивая поля
    const errorList = cook.checkValues(postData);
    if (errorList.length) {
        await con.end();
        cook.setCookie('updateError', 'true');
        console.log('Status: 301');
        console.log('Location: /web-backend/8/profile/\n');
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
        postData.fullName, 
        postData.phoneNumber, 
        postData.emailAddress, 
        postData.birthDate, 
        postData.sex, 
        postData.biography, 
        userId
    ];
    // Суём в массив если выбран только один язык, чтобы forEach заработал
    if (postData.language.constructor !== Array) {
        postData.language = [postData.language];
    }
    
    try {
        let promises = [];
        promises = [...promises, con.execute(sqlUserData, userData)];
        promises = [...promises, con.execute(sqlDeleteLanguages, [userId])];
        postData.language.forEach(lang => {
            promises = [...promises, con.execute(sqlInsertLanguages, [userId, lang])];
        });
        await Promise.all(promises);
    } catch (err) {
        showDBError(con, err);
        return;
    }



    con.commit();
    con.end();



    if (postData.js === 'disabled') {
        console.log('Status: 301');
        console.log('Location: /web-backend/8/profile/\n');
        return;
    }
    console.log();
    console.log(JSON.stringify(errorList));
} catch (err) {
    con.end();
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
    console.log(err);
}
};
