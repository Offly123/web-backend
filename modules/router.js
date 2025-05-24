'use strict';

// Получение параметров из ссылки
import { getLinkParams } from './requires/httpdata.js';


// Подключение модулей
import { GETmain, POSTlogin } from './main/main.js';
import { GETabout } from './about/about.js';
import { notFound } from './notFound/notFound.js';


// Список доступных путей
const GETRoutes = {
    undefined: GETmain,
    'main': GETmain,
    'about': GETabout
}

const POSTRoutes = {
    'login': POSTlogin,
}



// Берём из query путь и возвращаем модуль, если путь доступен, 
// иначе 404 Not Found
export function router() {
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
