#!/usr/bin/env node
"use strict";

const mysql = require('mysql2');
const querystring = require('querystring');
require('dotenv').config({
  path: "../../../.env"
});
const fs = require('fs');
const path = require('path');

let body = '';
process.stdin.on('data', (info) => {
  body += info.toString();
}).on('end', () => {
  
  let parsedData = querystring.parse(body);
  
  let currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() + 1);
  console.log('Set-Cookie: test153=1234; Expires=' + currentDate.toGMTString());
  console.log('Content-Type: text/html; charset=utf-8');
  console.log();
  
  console.log("Before file<br>");
  const myRead = fs.createReadStream(path.join(__dirname, '/index.html'), 'utf8');
  let page = '';
  myRead.on('data', (info) => {
    page += info;
  }).on('end', () => {
    console.log(page);
  }) 
  console.log("After file\n");



  if (parsedData.fullName.length > 150) {
    console.log("ФИО не может быть длиннее 150 символов");
    return;
  }

  if (!(/^[А-Яа-яЁё\s]+$/.test(parsedData.fullName))) {
    console.log("ФИО может содержать только кириллические символы и пробелы");
    return;
  }

  if (!(/^[0-9\s]+$/.test(parsedData.phone))) {
    console.log("Номер телефона может содержать только цифры и пробелы");
    return;
  }

  if (parsedData.sex == null) {
    console.log("Поле \"Пол\" не может быть пустым");
    return;
  }

  if (parsedData.language == undefined) {
    console.log("Выберите хотя бы один любимый язык программирования");
    return;
  }

  if (parsedData.biography == '') {
    console.log("Заполните поле \"Краткая биография\"");
    return;
  }

  if (parsedData.agreement == 'on') {
    console.log("Ознакомьтесь с приказом об отчислении и поставьте галочку");
    return;
  }



  const DB_HOST = process.env.DBHOST;
  const DB_USER = process.env.DBUSER;
  const DB_PSWD = process.env.DBPSWD;
  const DB_NAME = process.env.DBNAME;
  
  const con = mysql.createConnection({
    host:       DB_HOST,
    user:       DB_USER,
    password:   DB_PSWD,
    database:   DB_NAME
  });
  
  con.connect(function(err) {
    
    if (err) {
      throw err;
    };
    
    const data = {
      fullName: parsedData.fullName,
      phone: parsedData.phone,
      email: parsedData.email,
      birthDate: parsedData.birthDate,
      sex: parsedData.sex,
      biography: parsedData.biography
    };  



    let sql_users  = "INSERT IGNORE INTO users (full_name, phone, email, date_of_birth, gender, biography) values (?)";
    const users = [
      [data.fullName, data.phone, data.email, data.birthDate, data.sex, data.biography],
    ];
    let user_id;

    con.query(sql_users, users, function(err, result) {

      if (err) {
        throw err;
      };

      user_id = result.insertId;
      

    
      let sql_user_languages  = "INSERT IGNORE INTO user_languages (user_id, language_id) values ?";
      let user_languages = [];
      parsedData.language.forEach(element => {
        user_languages.push([user_id, element]);
      });

      con.query(sql_user_languages, [user_languages], function(err, result) {

        if (err) {
          throw err;
        };

        con.end();
      });
    });
  });
  console.log("Данные успешно обработаны");
});