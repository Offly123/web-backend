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
const { showError } = require('./cgi/hz.jss');

process.stdin.on('data', () => {

}).on('end', async () => {

    // console.log('Content-Type: application/json\n');

    let base = html.getHTML('base.html');

    let dataSend = cook.cookiesToJSON().dataSend;
    if (dataSend === 'false') {
        cook.deleteRegistrationData();
        base = html.addTemplate(
            base,
            html.getHTML('popup.html')
        );
    }
    
    const jwt = cook.cookiesToJSON().session;
    
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
    const sql_get_secret = `
        SELECT jwtKey FROM 
        jwt_keys 
        where userId = (?)
    `;
    let user_id = decoded[1].userId;
    let secret;
    
    // Получаем ключ JWT из БД
    try {
        secret = await con.execute(sql_get_secret, [user_id]);
    } catch (err) {
        showError(con, err);
        return;
    }
    
    // Если JWT не валидный - удаляем его и возвращаем
    // логин и регистрацию
    if (!myjwt.isValideJWT(decoded, secret[0][0].jwtKey)) {
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