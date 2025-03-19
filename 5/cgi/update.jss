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


process.stdin.on('data', () => {

}).on('end', async () => {
    console.log('Content-Type: application/json\n');
    console.log('update');
});