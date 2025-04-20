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
// При неправильных данных регистрации
// поля подсвечивает не сразу, а после перезагрузки
// 
//
// Сделать отображение профиля
// 
//
// Фронтенд для админки :skull:



process.stdin
.on('data', () => {

})
.on('end', async () => {
try{

    // console.log('Content-Type: application/json\n');

    // Парсим параметры из ссылки
    let path = process.env.REQUEST_URI.split('?');
    if (path[1]) {
        path[1].split('&');
    }

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