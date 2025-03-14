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

}).on('end', () => {

    try {
        // console.log('Content-Type: application/json; charset=utf-8\n');
        const page = fs.readFileSync('/home/u68757/www/web-backend/5/page.html', 'utf8');

        let editedPage = cook.cookiesInForm(page);

        console.log('Content-Type: text/html; charset=utf-8\n');

        console.log(editedPage);
        // console.log(process);
    } catch (err) {
        console.log(err);
    }

});