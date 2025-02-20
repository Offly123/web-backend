#!/usr/bin/env node
"use strict";

const mysql = require('mysql2');
const querystring = require('querystring');
const url = require('url');
require('dotenv').config({
  path: "../../../.env"
});

// let DB_HOST = myEnv.getDBHOST();
// let DB_USER = myEnv.getDBUSER();
// let DB_PSWD = myEnv.getDBPSWD();
// let DB_NAME = myEnv.getDBNAME(); 

// console.log(DB_HOST, DB_USER, DB_PSWD, DB_NAME);

let body = '';
process.stdin.on('data', chunk => {
  body += chunk.toString();
});

process.stdin.on('end', () => {
  
  const parsedData = querystring.parse(body);
  
  console.log('Content-Type: application/json');
  // console.log('Content-Type: text/html');
  console.log();

  // const myEnv = require('./env.jss')

  // console.log(myEnv);
  
  let DB_HOST = process.env.DBHOST;
  let DB_USER = process.env.DBUSER;
  let DB_PSWD = process.env.DBPSWD;
  let DB_NAME = process.env.DBNAME;

  console.log(DB_HOST);

  let con = mysql.createConnection({
    host:       DB_HOST,
    user:       DB_USER,
    password:   DB_PSWD,
    database:   DB_NAME
  });
  
  con.connect(function(err) {
    if (err) {
      console.log(err);
      throw err;
    };
    console.log("Connected\n");

    const data = {
      fullName: parsedData.fullName,
      phone: parsedData.phone,
      email: parsedData.email,
      birthDate: parsedData.birthDate,
      sex: parsedData.sex,
      biography: parsedData.biography
    };  

    let sql_injection  = "INSERT INTO users (full_name, phone, email, date_of_birth, gender, biography) VALUES (?)";
    let values = [
      [data.fullName, data.phone, data.email, data.birthDate, data.sex, data.biography]
    ];

    console.log(data);
    console.log("created");

    con.query(sql_injection, values, function(err, res) {

      if (err) {
        console.log("Error with injection");
        console.log(err);
        con.end();
        throw err;
      };

      console.log(res.affectedRows);
      con.end();

    })
  })
  console.log();
});