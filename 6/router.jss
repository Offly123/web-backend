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
// 1)   На странице логина при неправильных данных 
//      постоянно вылезает попап с ошибкой
//
// 2)   При неправильных данных регистрации
//      поля подсвечивает не сразу, а после перезагрузки
//
// 3)   Сделать отображение профиля
//
// 4)   Фронтенд для админки :skull:



process.stdin.on('data', () => {

}).on('end', async () => {

    // console.log('Content-Type: application/json\n');

    // Получение значения query из ссылки
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
});