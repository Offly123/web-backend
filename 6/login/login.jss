#!/usr/bin/env node
'use strict';



// Скрипт, отвечающий за обработку логина-пароля и 
// выдачу страницы с логином.
//
// Если данных в POST нет, выдаёт страницу. 
// Если есть - проверяет введённые данные с теми, что в БД. 
// Если неверный логин или пароль - сообщает пользователю. 
// Если всё верно - перенаправляет на /profile/.



const { createHash } = require('crypto');
const mysql = require('mysql2/promise');
const querystring = require('querystring');
require('dotenv').config({
    path: "../../../../.env"
});

const html = require('../requires/templates.jss')
const cook = require('../requires/cook.jss');
const myjwt = require('../requires/jwtlib.jss');
const { showDBError, connectToDB } = require('../requires/hz.jss');



let postData;

process.stdin
.on('data', (info) => {

    // Парсим данные из POST
    postData = querystring.parse(info.toString());

})
.on('end', async () => {
try {
    
    // console.log('Content-Type: application/json\n');
    // console.log(postData);
    

    console.log('Cache-Control: max-age=0, no-cache, no-store');


    // HTML с задним фоном и логином
    let base = html.getHTML('base.html');
    base = html.addTemplate(base, html.getHTML('login.html'));


    // Если в POST ничего нет - возвращает страницу
    if (!postData) {
        html.returnHTML(base);
        return;
    }

    
    
    const con = await connectToDB();
    
    
    
    // Сравнение отправленного пароля с хэшем пароля в БД
    let userPassword;
    const sqlGetPassword = `
    SELECT userPassword FROM 
    passwords 
    WHERE userLogin = (?)
    `;
    
    try {
        userPassword = await con.execute(sqlGetPassword, [postData.login]);
    } catch (err) {
        showDBError();
        return;
    }
    
    const providedPassword = createHash('sha256').update(postData.password).digest('base64');
    
    // Если неверный логин или пароль - возвращем страницу с ошибкой
    if (!userPassword[0][0] || providedPassword != userPassword[0][0].userPassword) {

        con.end();

        base = html.addTemplate(base, html.getHTML('popup-error.html'));
        html.returnHTML(base, postData);
        
        return;
    }

    // При правильном пароле берёт из БД ключ для этого пользователя
    // и записывает в куки его JWT на неделю
    let secret;
    let userId;

    const sqlGetKey = `
    SELECT jwtKey FROM (
        passwords JOIN jwtKeys ON passwords.userId = jwtKeys.userId
        ) 
        WHERE userLogin = (?)
    `;
    const sqlGetId = `
        SELECT userId FROM 
        passwords 
        where userLogin = (?)
    `;
    try {
        secret = await con.execute(sqlGetKey, [postData.login]);
        secret = secret[0][0].jwtKey;

        userId = await con.execute(sqlGetId, [postData.login]);
        userId = userId[0][0].userId;

    } catch (err) {
        showDBError();
        return;
    }

    const JWTInfo = {
        'userId': userId
    }
    const jwt = myjwt.createJWT(JWTInfo, secret);
    cook.setCookie('session', jwt, 60 * 60 * 24 * 7);



    con.commit();
    con.end();



    console.log('Location: /web-backend/6/profile\n');
} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log(err);
}
});

// #!/usr/bin/env node
// 'use strict';


// const mysql = require('mysql2/promise');
// const url = require('url')
// const querystring = require('querystring');


// require('dotenv').config({
//     path: "../../../../.env"
// });


// const cook = require('../requires/cook.jss');
// const myjwt = require('../requires/jwtlib.jss');
// const html = require('../requires/templates.jss');
// const { showDBError, DBDataToJSON, connectToDB } = require('../requires/hz.jss');


// let postData;

// process.stdin.on('data', (info) => {

//     // Записываем данные из POST в JSON
//     postData = querystring.parse(info.toString());

// }).on('end', async () => {
        
//     // console.log('Content-Type: application/json\n');

//     // TODO: в index.jss перенаправление на profile только если есть jwt
//     // При отправке логина пароля кидать POST на index.jss и 
//     // создавать jwt, если логин пароль правильные

//     // Получение значения query из ссылки
//     let path = process.env.REQUEST_URI.split('?');
//     if (path[1]) {
//         path[1].split('&');
//     }    
    
//     let params = {};
//     path.forEach(elem => {
//         params[elem.split('=')[0]] = elem.split('=')[1];
//     });
    


//     // Перенаправление на /admin
//     if (params.query === 'admin') {
//         console.log('Location: /web-backend/6/admin\n');
//         return;
//     }
    
//     // Перенаправление на /profile
//     const jwt = cook.cookiesToJSON().session;
//     if (jwt) {
//         console.log('Location: /web-backend/6/profile\n');
//         return;
//     }
    
    
    
//     const anyErrors = cook.cookiesToJSON().anyErrors;
//     const dataSentFirstTime = cook.cookiesToJSON().dataSentFirstTime;
    
//     // HTML с задним фоном
//     let base = html.getHTML('base.html');
//     // Добавляем логин регистрацию
//     base = html.addTemplate(base, html.getHTML('forms.html'));
//     html.returnHTML(base);
    
//     // if (anyErrors === 'false' && dataSentFirstTime === 'true') {
//     //     cook.deleteRegistrationData();
//     //     base = html.addTemplate(base, html.getHTML('popup.html'));
//     // }
    
    
//     // // Если неправильный логин/пароль добавляем окно с ошибкой
//     // let wrongLogin = cook.cookiesToJSON().wrongLogin;
//     // if (wrongLogin === 'true') {
//     //     base = html.addTemplate(base, html.getHTML('popup-error.html'));
//     // }
    
    
//     // // Если отсутствует JWT - возвращает HTML в формами
//     // if (!jwt) {
//     //     base = html.addTemplate(base, html.getHTML('forms.html'));
//     //     let data = cook.cookiesToJSON();
//     //     html.returnHTML(base, data);
//     //     return;
//     // }
    
    
//     // let decoded = myjwt.decodeJWT(jwt);
    
    
//     // const con = await connectToDB();
//     // con.beginTransaction();
    
    
    
//     // // Если есть валидный JWT - возвращаем личный кабинет, 
//     // // иначе логин и регистрацию
//     // const sqlGetSecret = `
//     // SELECT jwtKey FROM 
//     // jwtKeys 
//     // where userId = (?)
//     // `;
//     // let userId = decoded[1].userId;
//     // let secret;
    
//     // try {
//     //     secret = await con.execute(sqlGetSecret, [userId]);
//     // } catch (err) {
//     //     showDBError(con, err);
//     //     return;
//     // }
    
//     // // Если JWT не валидный - удаляем его и возвращаем 
//     // // HTML с формами
//     // if (secret[0][0] == undefined || !myjwt.isValideJWT(decoded, secret[0][0].jwtKey)) {
//     //     cook.setCookie('session', '', -1);
//     //     con.rollback();
//     //     con.end();
//     //     base = html.addTemplate(base, html.getHTML('forms.html'));
//     //     let data = cook.cookiesToJSON();
//     //     html.returnHTML(base);
//     //     return;
//     // }



//     // // Получаем данные пользователя из БД чтобы вставить 
//     // // в личный кабинет
//     // let sqlGetData = `
//     // SELECT * from users
//     // WHERE userId = ?
//     // `;
//     // let sqlGetLanguages = `
//     // SELECT languageId from userLanguages
//     // WHERE userid = ?
//     // `;
//     // let data;
//     // try {
//     //     let personalData = await con.execute(sqlGetData, [userId]);
//     //     let languages = await con.execute(sqlGetLanguages, [userId]);
//     //     data = DBDataToJSON(personalData, languages);
//     // } catch (err) {
//     //     showDBError(con, err);
//     //     return;
//     // }



//     // con.commit();
//     // con.end();



//     // // Если валидный JWT - возвращаем личный кабинет
//     // // console.log(data);
//     // cook.setCookie('dataSentFirstTime', '', -1);
//     // cook.deleteRegistrationData();
//     // base = html.addTemplate(base, html.getHTML('profile.html'));
//     // html.returnHTML(base, data);
// });