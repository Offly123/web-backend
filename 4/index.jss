#!/usr/bin/env node
'use strict';

const mysql = require('mysql2');
const querystring = require('querystring');
const url = require('url');
const fs = require('fs');
require('dotenv').config({
  path: "../../../.env"
});
const cook = require('./cook.jss');

process.stdin.on('data', () => {
  
}).on('end', async () => {
  console.log('Content-Type: text/html; charset=utf-8');
  // console.log('Content-Type: application/json; charset=utf-8');
  console.log();


  // let cookieList = cook.cookiesToJSON();
  // console.log(cookieList);

  try {
    const page = fs.readFileSync('/home/u68757/www/web-backend/4/page.html', 'utf8');
    

    console.log(page);
  } catch (err) {
    console.log(err);
  }
  
});