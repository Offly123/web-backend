'use strict';

const { cook } = require('./requires/cook.js');

// Получение параметров из ссылки
const { getLinkParams } = require('./requires/httpdata.js');


// Подключение модулей
const { GETmain } = require('./main/main.js');
const { GETabout } = require('./about/about.js');
const { GETregistration, POSTregistration } = require('./registration/registration.js');
const { GETlogin, POSTlogin } = require('./login/login.js');
const { GETprofile, POSTprofile } = require('./profile/profile.js');
const { GETadmin, POSTadmin } = require('./admin/admin.js');
const { GETedit, POSTedit } = require('./edit/edit.js');
const { notFound } = require('./notFound/notFound.js');


// Список доступных путей
const GETRoutes = {
    undefined: GETmain,
    'main': GETmain,
    'about': GETabout,
    'registration': GETregistration,
    'login': GETlogin,
    'profile': GETprofile,
    'admin': GETadmin,
    'edit': GETedit
}

const POSTRoutes = {
    'registration': POSTregistration,
    'login': POSTlogin,
    'profile': POSTprofile,
    'admin': POSTadmin,
    'edit': POSTedit
}



// Берём из query путь и возвращаем модуль, если путь доступен, 
// иначе 404 Not Found
exports.router = () => {
    const query = getLinkParams().query?.replace(/\/$/, '').split('&')[0];
    // console.log(query);

    let route;

    if (process.env.REQUEST_METHOD === 'GET') {
        route = GETRoutes[query];
    }

    if (process.env.REQUEST_METHOD === 'POST') {
        route = POSTRoutes[query];
    }
    
    return route ? route : notFound;
}
