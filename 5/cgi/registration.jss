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
const myjwt = require('./jsonlib.jss');

process.stdin.on('data', async () => {

}).on('end', async () => {

    let requestURI = process.env.REQUEST_URI;
    let formData = url.parse(requestURI, true).query;

    // console.log('Content-Type: application/json\n');
    cook.formDataToCookie(formData);

    if (!cook.checkValues(formData)) {
        console.log('Location: /web-backend/5\n');
        // console.log('Content-Type: application/json\n');
        // console.log('inside if');
        return;
    }
    
    
    const con = await mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPSWD,
        database: process.env.DBNAME
    });
    

    try {


        // Вставка основных данных пользователя в users
        let sql_users = 'INSERT IGNORE INTO users (full_name, phone, email, date_of_birth, gender, biography) values (?, ?, ?, ?, ?, ?)';
        const users = [
            formData.fullName, formData.phoneNumber, formData.emailAddress, formData.birthDate, formData.sex, formData.biography,
        ];

        let result = await con.execute(sql_users, users);



        // Вставка выбранных языков в user_languages
        let sql_user_languages = 'INSERT IGNORE INTO user_languages (user_id, language_id) values (?, ?)';
        let user_id = result[0].insertId;

        if (formData.language.constructor !== Array) {
            formData.language = [formData.language];
        }
        await formData.language.forEach(language_id => {
            let user_languages = [user_id, language_id];
            con.execute(sql_user_languages, user_languages);
        });



        // Вставка логина и пароля в passwords
        let login = cook.generateString();
        let password = cook.generateString();

        // Запись логина и пароля во временный файл, чтобы отобразить пользователю
        fs.writeFileSync('auth.txt', login + ';' + password);

        password = createHash('sha256').update(password).digest('base64');
        let sql_passwords = 'INSERT IGNORE INTO passwords (user_id, user_login, user_password) values (?, ?, ?)';
        let passwords = [
            user_id, login, password
        ];

        await con.execute(sql_passwords, passwords);



        // Вставка случайного ключа для подписи JWT пользователя
        const sql_jwt_keys = 'INSERT IGNORE INTO jwt_keys (user_id, jwt_key) values (?, ?)';
        const JWTInfo = {
            'user_id': user_id
        }
        const secret = Math.floor(Math.random() * 1000000).toString();
        const jwt = myjwt.createJWT(JWTInfo, secret);
        const jwt_keys = [
            user_id, secret
        ]
        await con.execute(sql_jwt_keys, jwt_keys);
        cook.setCookie('session', jwt, 60 * 60 * 24 * 365);


    } catch (err) {
        console.log('Content-Type: application/json\n');
        console.log('Ошибка при вставке');
        console.log(err);
    } finally {
        await con.end();
    }
    console.log('Location: /web-backend/5\n');
});