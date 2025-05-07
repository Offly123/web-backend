#!/usr/bin/env node
'use strict';



// Скрипт, отвечающий за роутинг. 
// Читает query из параметров ссылки и в 
// зависимости от значения подключает 
// нужный модуль.
//
// значение -> /значение/
// Пример: 
// admin -> /admin/
// 
// По стандарту перенаправляет на login.


const { router } = require('../modules/router.js');

let postData;
process.stdin.on('data', (data) => {

    postData = data;

}).on('end', async () => {
try{
    // console.log('Content-Type: application/json\n');

    console.log('Cache-Control: max-age=0, no-cache, no-store');

    const getRouted = router();
    getRouted();
    
} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
    console.log(err);
}
});