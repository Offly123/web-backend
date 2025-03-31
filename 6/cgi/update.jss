#!/usr/bin/env node
'use strict';


const mysql = require('mysql2/promise');
const querystring = require('querystring');
require('dotenv').config({
    path: "../../../../.env"
});
const cook = require('./cook.jss');
const myjwt = require('./jwtlib.jss');
const { showDBError } = require('./hz.jss');


let body = '';
process.stdin.on('data', (chunk) => {

    body += chunk.toString();
    
}).on('end', async () => {
    
    // console.log('Content-Type: application/json\n');

    let formData = querystring.parse(body);

    cook.formDataToCookie(formData);
    
    // Проверка введённых значений
    // console.log(body);
    if (!cook.checkValues(formData)) {
        console.log('Location: /web-backend/6\n');
        return;
    }
    
    const con = await mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPSWD,
        database: process.env.DBNAME
    });
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



    console.log('Location: /web-backend/6\n');
});