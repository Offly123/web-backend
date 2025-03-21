#!/usr/bin/env node
'use strict';


const { createHash } = require('crypto');
const mysql = require('mysql2/promise');
const url = require('url');
const fs = require('fs');
require('dotenv').config({
    path: "../../../../.env"
});
const cook = require('./cook.jss');
const myjwt = require('./jwtlib.jss');
const { showError } = require('./hz.jss');


process.stdin.on('data', () => {

}).on('end', async () => {
    
    // console.log('Content-Type: application/json\n');

    let requestURI = process.env.REQUEST_URI;
    let formData = url.parse(requestURI, true).query;

    // Проверка введённых значений
    if (!cook.checkValues(formData)) {
        console.log('Location: /web-backend/5\n');
        return;
    }


    const con = await mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPSWD,
        database: process.env.DBNAME
    });
    con.beginTransaction();


    // Берёт из JWT user_id и обновляет данные в users
    // TODO: обновить также данные в user_languages
    let jwt = cook.cookiesToJSON().session;
    let user_id = myjwt.decodeJWT(jwt)[1].userId;
    let sql_user_data = `
        UPDATE users SET 
            fullName=?, phoneNumber=?, emailAddress=?, birthDate=?, sex=?, biography=? 
        WHERE userId = ?
    `;
    let user_data = [
        formData.fullName, formData.phoneNumber, formData.emailAddress, formData.birthDate, formData.sex, formData.biography, user_id
    ];

    

    try {
        con.execute(sql_user_data, user_data);
    } catch (err) {
        showError();
        return;
    }



    con.commit();
    con.end();



    console.log('Location: /web-backend/5\n');
});