// Получение параметров из ссылки
import { getLinkParams } from './requires/httpdata.js';


// Подключение модулей
import { login } from './login/login.js';
import { registration } from './registration/registration.js';
import { notFound } from './notFound/notFound.js';


// Список доступных путей
const availableRoutes = {
    'login': login,
    'registration': registration,

}


// Берём из query путь и возвращаем модуль, если путь доступен, 
// иначе notFound
export function router() {
    const query = getLinkParams().query?.replaceAll('/', '');
    const route = availableRoutes[query];
    return route ? route : notFound;
}