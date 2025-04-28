#!/usr/bin/env node
'use strict';



// Скрипт, отвечающий за роутинг. 
// Читает query из параметров ссылки и в 
// зависимости от значения перенаправляет 
// при помощи HTTP Locate на другие скрипты.
//
// значение -> /значение/
// Пример: 
// admin -> /admin/
// 
// По стандарту перенаправляет на login.
//
//
//
// TODO:
// Добавить пользователям JWT в HTML



const { getLinkParams } = require('./requires/httpdata.jss');
const cook = require('./requires/cook.jss');

process.stdin.on('data', () => {

}).on('end', async () => {
try{


    console.log('Cache-Control: max-age=0, no-cache, no-store');
    
    // Парсим параметры из ссылки
    let params = getLinkParams();
    
    
    
    // Перенаправление на /admin/
    if (params.query === 'admin') {
        console.log('Location: /web-backend/6/admin\n');
        return;
    }

    // Перенаправление на /profile/
    if (params.query === 'profile') {
        console.log('Location: /web-backend/6/profile\n');
        return;
    }

    // Перенаправление на /registration/
    if (params.query === 'registration') {
        console.log('Location: /web-backend/6/registration\n');
        return;
    }

    // Перенаправление на /edit/
    if (params.query === 'edit') {
        console.log('Location: /web-backend/6/edit/\n');
        return;
    }

    // Выход из профиля (удаления JWT из cookie)
    if (params.query === 'exit') {
        cook.setCookie('session', '', -1);
    }


    console.log('Location: /web-backend/6/login\n');
} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
}
});