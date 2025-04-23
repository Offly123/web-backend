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
// ☠ ☠ ☠ ☠ Фронтенд для админки ☠ ☠ ☠ ☠



process.stdin.on('data', () => {

}).on('end', async () => {
try{


    console.log('Cache-Control: max-age=0, no-cache, no-store');
    
    // Парсим параметры из ссылки
    let path = process.env.QUERY_STRING.split('&');
    
    let params = {};
    path.forEach(elem => {
        params[elem.split('=')[0]] = elem.split('=')[1];
    });
    
    
    
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


    console.log('Location: /web-backend/6/login\n');
} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log(err);
}
});