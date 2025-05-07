// "Библиотека" для работы с JWT


import { createHmac } from 'crypto';


// Получает JSON данных и время действия в секундах, создаёт payload
const createPayload = (info, lifeTime) => {
    let payload = {
        'iat': Math.floor(Date.now() / 1000),
        'exp': Math.floor(Date.now() / 1000) + lifeTime
    }

    for (let field in info) {
        payload[field] = info[field];
    }

    return payload;
};


// Получает объекты header и payload, строку secret и возвращает подпись 
const createSignature = (header, payload, secret) => {
    return createHmac('sha256', secret)
        .update(header + '.' + payload)
        .digest('base64url')
};


// Получает JSON и секретный ключ, выдаёт jwt
export function createJWT(payload, secret, lifeTime) {  
    let header = {
        'alg': 'HS256',
        'typ': 'JWT'
    };
    header = Buffer.from(JSON.stringify(header)).toString('base64url');
    payload = createPayload(payload, lifeTime);
    payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    let signature = createSignature(header, payload, secret);
    
    return header + '.' + payload + '.' + signature;
}


// Получает JWT в виде строки и возвращает его декодированным в 
// виде массива (0 - голова, 1 - тело, 2 - подпись).
export function decodeJWT(jwt) {
    try {
        jwt = jwt.split('.');
        jwt[0] = Buffer.from(jwt[0], 'base64url').toString('utf8');
        jwt[1] = Buffer.from(jwt[1], 'base64url').toString('utf8');
        jwt[0] = JSON.parse(jwt[0]);
        jwt[1] = JSON.parse(jwt[1]);
        return jwt;
    } catch {
        return undefined;
    }
}


// Получает декодированный JWT в виде массива и ключ
export function isValideJWT(decoded, secret) {
    // Если JWT undefined
    if (decoded == undefined) {
        return false;
    }
    // Если не передали ключ (в БД нет такого)
    if (secret == undefined) {
        return false;
    }
    // Если истекла дата - невалидный
    if ((decoded[1].exp - 1) < (Date.now() / 1000)) {
        return false;
    }

    let header = JSON.stringify(decoded[0]);
    header = Buffer.from(header).toString('base64url');
    let payload = JSON.stringify(decoded[1]);
    payload = Buffer.from(payload).toString('base64url');
    
    return createSignature(header, payload, secret) === decoded[2];
}