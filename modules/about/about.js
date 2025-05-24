'use strict';



// Скрипт, отвечающий за обработку логина-пароля и 
// выдачу страницы с логином.
//
// Если данных в POST нет, выдаёт страницу. 
// Если есть - проверяет введённые данные с теми, что в БД. 
// Если неверный логин или пароль - сообщает пользователю. 
// Если всё верно - перенаправляет на /profile/.



import { createHash } from 'crypto';
import dotenv from 'dotenv';
dotenv.config({path: '../../../.env'});

import * as html from '../requires/templates.js';
import * as cook from '../requires/cook.js';
import * as myjwt from '../requires/jwtlib.js';
import { getLinkParams } from '../requires/httpdata.js';
import { showDBError, connectToDB } from '../requires/hz.js';



export async function GETabout() {
try{

    // console.log('Content-Type: application/json\n');
    // console.log(process.env);
    
    
    console.log('Cache-Control: max-age=0, no-cache, no-store');
    // HTML с задним фоном и логином
    let base = html.getHTML('base.html');
    if (cook.cookiesToJSON().wrongLogin === 'true') {
        base = html.addBody(base, 'popup-error.html');
        base = html.addStyle(base, 'popup-error.html');
        cook.setCookie('wrongLogin', 'false');
    }
    
    

    html.returnHTML(base);

} catch(err) {
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
    console.log(err);
}
}
