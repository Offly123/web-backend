#!/usr/bin/env node
"use strict";

const mysql = require('mysql2');
const querystring = require('querystring');
const url = require('url');
require('dotenv').config({
  path: "../../../.env"
});

let body = '';
process.stdin.on('data', chunk => {
  body = chunk.toString();
});

process.stdin.on('end', () => {

  console.log('Content-Type: application/json');
  console.log();

  let parsedData = querystring.parse(body);

  let DB_HOST = process.env.DBHOST;
  let DB_USER = process.env.DBUSER;
  let DB_PSWD = process.env.DBPSWD;
  let DB_NAME = process.env.DBNAME;
  
  let con = mysql.createConnection({
    host:       DB_HOST,
    user:       DB_USER,
    password:   DB_PSWD,
    database:   DB_NAME
  });
  
  con.connect(function(err) {
    console.log("HERE");
    
    if (err) {
      console.log(err)
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
        console.log(err);
        throw err;
      };

      console.log("users inserted");
      user_id = result.insertId;
      console.log("user_id = " + user_id);
      

    
      let sql_user_languages  = "INSERT IGNORE INTO user_languages (user_id, language_id) values ?";
      let user_languages = [];
      parsedData.language.forEach(element => {
        user_languages.push([user_id, element]);
      });

      console.log(user_languages);

      con.query(sql_user_languages, [user_languages], function(err, result) {

        if (err) {
          console.log(err);
          throw err;
        };

        console.log("user languages inserted");

      });
    });
  })
});