#!/usr/bin/env node
'use strict';

const mysql = require('mysql2');
const url = require('url');
require('dotenv').config({
  path: "../../../.env"
});
const cook = require('./cook.jss');

process.stdin.on('data', () => {
  
}).on('end', () => {
  
  let requestURI = process.env.REQUEST_URI;
  let formData = url.parse(requestURI, true).query;

  // console.log('Content-type: application/json\n');
  // console.log('Location: /web-backend/4\n');
  cook.formDataToCookie(formData);
  
  
  // console.log("he");
  if (!cook.checkValues(formData)) {
    // console.log('Content-type: application/json\n');
    // console.log(formData);
    // console.log('Location: /web-backend/4\n');
    return;
  }
  console.log('Content-type: application/json\n');
  console.log(formData);

  // console.log("he");
  // return;
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
      fullName: formData.fullName,
      phone: formData.phoneNumber,
      email: formData.emailAddress,
      birthDate: formData.birthDate,
      sex: formData.sex,
      biography: formData.biography
    };  


    let sql_users  = 'INSERT IGNORE INTO users (full_name, phone, email, date_of_birth, gender, biography) values (?)';
    const users = [
      [data.fullName, data.phone, data.email, data.birthDate, data.sex, data.biography],
    ];
    let user_id;

    con.query(sql_users, users, function(err, result) {

      if (err) {
        throw err;
      };

      user_id = result.insertId;
      

    
      let sql_user_languages  = 'INSERT IGNORE INTO user_languages (user_id, language_id) values ?';
      let user_languages = [];
      formData.language.forEach(element => {
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
});