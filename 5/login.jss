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
    
});