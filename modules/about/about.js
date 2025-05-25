'use strict';



// Скрипт, отвечающий за обработку логина-пароля и 
// выдачу страницы с логином.
//
// Если данных в POST нет, выдаёт страницу. 
// Если есть - проверяет введённые данные с теми, что в БД. 
// Если неверный логин или пароль - сообщает пользователю. 
// Если всё верно - перенаправляет на /profile/.



const { createHash } = require('crypto');
const dotenv = require('dotenv');
dotenv.config({path: '../../../.env'});

const html = require('../requires/templates.js');
const cook = require('../requires/cook.js');
const myjwt = require('../requires/jwtlib.js');
const { getLinkParams } = require('../requires/httpdata.js');
const { showDBError, connectToDB } = require('../requires/hz.js');



exports.GETabout = async () => {
try{

    // console.log('Content-Type: application/json\n');
    // console.log(process.env);
    
    
    console.log('Cache-Control: max-age=0, no-cache, no-store');
    // HTML с задним фоном и "о нас"
    let base = html.getHTML('base.html');
    base = html.addBody(base, 'about.html');
    base = html.addStyle(base, 'about.html')
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
