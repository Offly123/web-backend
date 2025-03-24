#!/usr/bin/env node
'use strict';

const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config({
    path: "../../../.env"
});
const cook = require('./cgi/cook.jss');
const myjwt = require('./cgi/jwtlib.jss');
const html = require('./cgi/templates.jss');
const { showDBError } = require('./cgi/hz.jss');

process.stdin.on('data', () => {

}).on('end', async () => {

    // console.log('Content-Type: application/json\n');
    
    // Логин: 3nUVhpBfcG
    
    // Пароль: kokYJ2rgtD
    
    let base = html.getHTML('base.html');
    
    let anyErrors = cook.cookiesToJSON().anyErrors;
    if (anyErrors === 'false') {
        cook.deleteRegistrationData();
        base = html.addTemplate(
            base,
            html.getHTML('popup.html')
        );
    }
    // console.log('hehe');
    
    const jwt = cook.cookiesToJSON().session;
    
    // Если неправильный логин/пароль добавляем окно с ошибкой
    let wrongLogin = cook.cookiesToJSON().wrongLogin;
    if (wrongLogin === 'true') {
        base = html.addTemplate(
            base,
            html.getHTML('popup-error.html')
        );
    }
    // Если отсутствует JWT - возвращает формы
    if (!jwt) {
        base = html.addTemplate(
            base,
            html.getHTML('forms.html')
        );
        html.returnHTML(base);
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
    
    
    // Если есть JWT - возвращаем личный кабинет,
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
    // логин и регистрацию
    if (secret[0][0] == undefined || !myjwt.isValideJWT(decoded, secret[0][0].jwtKey)) {
        cook.setCookie('session', '', -1);
        con.rollback();
        con.end();
        base = html.addTemplate(
            base,
            html.getHTML('forms.html')
        );
        html.returnHTML(base);
        return;
    }
    
    
    
    con.commit();
    con.end();
    
    

    // Если валидный JWT - возвращаем личный кабинет
    base = html.addTemplate(
        base, 
        html.getHTML('profile.html')
    );
    html.returnHTML(base);
});