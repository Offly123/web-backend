'use strict';

// Получение параметров из ссылки
const { getLinkParams } = require('./requires/httpdata.js');


// Подключение модулей
const { GETmain, POSTlogin } = require('./main/main.js');
const { GETabout } = require('./about/about.js');
const { notFound } = require('./notFound/notFound.js');
const { GETregistration, POSTregistration } = require('./registration/registration.js');


// Список доступных путей
const GETRoutes = {
    undefined: GETmain,
    'main': GETmain,
    'about': GETabout,
    'registration': GETregistration
}

const POSTRoutes = {
    'login': POSTlogin,
    'registration': POSTregistration
}



// Берём из query путь и возвращаем модуль, если путь доступен, 
// иначе 404 Not Found
exports.router = () => {
    const query = getLinkParams().query?.replace(/\/$/, '');

    let route;

    if (process.env.REQUEST_METHOD === 'GET') {
        route = GETRoutes[query];
    }

    if (process.env.REQUEST_METHOD === 'POST') {
        route = POSTRoutes[query];
    }
    
    return route ? route : notFound;
}
