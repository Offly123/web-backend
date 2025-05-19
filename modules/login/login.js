'use strict';



// Скрипт, отвечающий за обработку логина-пароля и 
// выдачу страницы с логином.
//
// Если данных в POST нет, выдаёт страницу. 
// Если есть - проверяет введённые данные с теми, что в БД. 
// Если неверный логин или пароль - сообщает пользователю. 
// Если всё верно - перенаправляет на /profile/.



import { createHash } from 'crypto';
import dotenv from 'dotenv';
dotenv.config({path: '../../../.env'});

import * as html from '../requires/templates.js';
import * as cook from '../requires/cook.js';
import * as myjwt from '../requires/jwtlib.js';
import { getLinkParams } from '../requires/httpdata.js';
import { showDBError, connectToDB } from '../requires/hz.js';



export async function GETlogin() {
try{

    // console.log('Content-Type: application/json\n');
    // console.log(process.env);
    
    
    console.log('Cache-Control: max-age=0, no-cache, no-store');
    // HTML с задним фоном и логином
    let base = html.getHTML('base.html');
    base = html.addBody(base, 'login.html');
    base = html.addStyle(base, 'login.html');
    if (cook.cookiesToJSON().wrongLogin === 'true') {
        base = html.addBody(base, 'popup-error.html');
        base = html.addStyle(base, 'popup-error.html');
        cook.setCookie('wrongLogin', 'false');
    }
    
    
    
    // Если в POST ничего нет - возвращает страницу
    html.returnHTML(base);

} catch(err) {
    console.log('Content-Type: application/json\n');
    console.log(err);
}
}



export async function POSTlogin(postData) {
try {

    // console.log('Content-Type: applictaion/json\n');

    // Если есть JWT - перекидывает на profile
    if (cook.cookiesToJSON().session) {
        console.log('Location: /web-backend/8/profile/\n');
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
        console.log('Location: /web-backend/8/login/\n');

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
    };
    const jwt = myjwt.createJWT(JWTInfo, secret, 60 * 60 * 24 * 7);
    cook.setCookie('session', jwt, 60 * 60 * 24 * 7);



    con.commit();
    con.end();



    console.log('Location: /web-backend/8/profile/\n');   
} catch(err) {
    console.log('Content-Type: application/json\n');
    console.log(err);
}
}