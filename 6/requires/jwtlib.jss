// "Библиотека" для работы с JWT


const { createHmac } = require('crypto');


// Получает объект данных и создаёт paylod (iat текущая дата, exp на +1 год)
const createPayload = (info) => {
    let payload = {
        'iat': Math.floor(Date.now() / 1000),
        'exp': Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365
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
exports.createJWT = (payload, secret) => {
    let header = {
        'alg': 'HS256',
        'typ': 'JWT'
    };
    header = Buffer.from(JSON.stringify(header)).toString('base64url');
    payload = createPayload(payload);
    payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    let signature = createSignature(header, payload, secret);
    
    return header + '.' + payload + '.' + signature;
}


// Получает JWT в виде строки и возвращает его декодированным в 
// виде массива (0 - голова, 1 - тело).
exports.decodeJWT = (jwt) => {
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


// Получает JWT в виде массива и ключ
exports.isValideJWT = (decoded, secret) => {
    if (secret[0][0] == undefined) {
        return false;
    }
    let header = JSON.stringify(decoded[0]);
    header = Buffer.from(header).toString('base64url');
    let payload = JSON.stringify(decoded[1]);
    payload = Buffer.from(payload).toString('base64url');
    
    return createSignature(header, payload, secret) === decoded[2];
}