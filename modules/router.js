'use strict';

// Получение параметров из ссылки
import { getLinkParams } from './requires/httpdata.js';


// Подключение модулей
import { GETlogin, POSTlogin } from './login/login.js';
import { GETregistration, POSTregistration } from './registration/registration.js';
import { GETprofile, POSTprofile } from './profile/profile.js';
import { admin } from './admin/admin.js';
import { edit } from './edit/edit.js'
import { notFound } from './notFound/notFound.js';


// Список доступных путей
const GETRoutes = {
    undefined: GETlogin,
    'login': GETlogin,
    'registration': GETregistration,
    'profile': GETprofile,
    'admin': admin,
    'edit': edit,
}

const POSTRoutes = {
    'login': POSTlogin,
    'registration': POSTregistration,
    'profile': POSTprofile
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
