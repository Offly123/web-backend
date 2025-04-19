#!/usr/bin/env node
'use strict';



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
    base = html.addTemplate(base, html.getHTML('profile.html'));


    // Если в POST ничего нет - возвращает страницу
    if (!postData) {
        html.returnHTML(base);
        return;
    }
    
    const con = connectToDB();
    con.beginTransaction();
    
    
    // Берёт из JWT userId и обновляет данные в users
    let jwt = cook.cookiesToJSON().session;
    let userId = myjwt.decodeJWT(jwt)[1].userId;
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
        formData.fullName, formData.phoneNumber, formData.emailAddress, formData.birthDate, formData.sex, formData.biography, userId
    ];
    // Суём в массив если выбран только один язык, чтобы forEach заработал
    if (formData.language.constructor !== Array) {
        formData.language = [formData.language];
    }
    
    try {
        con.execute(sqlUserData, userData);
        con.execute(sqlDeleteLanguages, [userId]);
        formData.language.forEach(lang => {
            con.execute(sqlInsertLanguages, [userId, lang]);
        })
    } catch (err) {
        showDBError();
        return;
    }



    con.commit();
    con.end();
} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log(err);
}
});