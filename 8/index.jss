#!/usr/bin/env node
'use strict';



const { parseURLEncodedData } = require('../modules/requires/httpdata.js');



// Скрипт, отвечающий за роутинг. 
// Читает query из параметров ссылки и 
// в зависимости от значения подключает 
// нужный модуль.
// По стандарту перенаправляет на login.

const { router } = require('../modules/router.js');



let postData = '';
process.stdin.on('data', (data) => {

    postData += data;

}).on('end', async () => {
try{
    // console.log('Content-Type: application/json\n');
    // console.log('\nhere\n');
    // console.log(postData);


    console.log('Cache-Control: max-age=0, no-cache, no-store');
    // console.log(process.env);

    const getRoutated = router();

    // console.log(getRoutated);

    const JSONPostData = parseURLEncodedData(postData);
    
    await getRoutated(JSONPostData);

} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
    console.log(err);
}
});
