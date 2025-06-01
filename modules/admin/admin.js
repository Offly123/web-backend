#!/usr/bin/env node
'use strict';



// Скрипт, отвечающий за отображение админки
//
// Сначала кидает HTTP авторизацию:
//      Если логин/пароль кривые - кидаем 401 Unauthorized
//
// Если всё ок - делаем запросы в БД, получаем статистику 
// по языкам и все логины пользователей
//
// Вставляем языки в таблицу и выводим пользователей
// Если нажали на изменение данных перенаправляем на /edit/



require('dotenv').config({
    path: "../../../../.env"
});
const myjwt = require('../requires/jwtlib.js');
const html = require('../requires/templates.js');
const { getLinkParams, parseURLEncodedData } = require('../requires/httpdata.js');
const { showDBError, connectToDB, getSHA256 } = require('../requires/hz.js');

exports.GETadmin = async () => {
try{

    // console.log('Content-Type: application/json\n');
    // console.log('');

    // Если через HTTP не отправлены логин/пароль - кидаем HTTP авторизацию
    console.log('Cache-Control: max-age=0, no-cache');
    if (!process.env.HTTP_AUTHORIZATION) {
        console.log('Status: 401 Unauthorized');
        console.log('WWW-Authenticate: Basic realm="admin"\n');
        return;
    }
    
    
    
    let con = await connectToDB();
    
    
    
    const adminAuthData = Buffer.from(process.env.HTTP_AUTHORIZATION, 'base64url').toString('utf-8').split(':');
    let sqlAdminPassword = `
    SELECT adminPassword FROM adminPasswords
    WHERE adminLogin = ?
    `;
    let adminPassword;
    try {
        let adminPasswordInDB = (await con.execute(sqlAdminPassword, [adminAuthData[0]]))[0][0];
        if (adminPasswordInDB) {
            adminPassword = adminPasswordInDB.adminPassword;
        }
    } catch (err) {
        showDBError(con, err);
        return;
    }
    
    
    
    // Если неправильный логин пароль - кидаем 403
    if (getSHA256(adminAuthData[1]) !== adminPassword) {
        con.end();
        console.log('Status: 403 Forbidden\n');
        return;
    }
    
    // Получаем логины пользователей и статистику языков (языки строкой через запятую)
    let sqlUsersInfo = `
    SELECT 
    u.userId, userLogin, 
        fullName, phoneNumber, emailAddress, 
        DATE_FORMAT(birthDate, "%d %m %Y") as birthDate, 
        sex, biography, 
        GROUP_CONCAT(l.languageName) AS languages
    FROM users u 
        JOIN passwords p ON u.userId = p.userId 
        JOIN userLanguages ul ON u.userId = ul.userId
        JOIN languages l ON ul.languageId = l.languageId
    GROUP BY u.userId
    `;
    let sqlLanguageStatistics = `
    SELECT COUNT(userId) as languageCount, languageName FROM 
    (userLanguages JOIN languages ON userLanguages.languageId = languages.languageId)
    GROUP BY userLanguages.languageId
    ORDER BY COUNT(userId) DESC;
    `;
    let languageStatistics;
    let usersInfo;
    try {
        usersInfo    = await con.execute(sqlUsersInfo);
        usersInfo    = usersInfo[0];
        
        languageStatistics = await con.execute(sqlLanguageStatistics);
        languageStatistics = languageStatistics[0];
    } catch (err) {
        showDBError(con, err);
        console.log(err);
    }
    
    
    
    con.end();
    
    
    
    // Добавляем страницу админки
    let base = html.getHTML('base.html');
    base = html.addBody(base, 'admin.html');
    base = html.addStyle(base, 'admin.html');
    
    // Добавляем пользователей
    usersInfo.forEach(user => {
        user.languages = user.languages.replace(/,/g, ', ');
        let users = html.getHTML('users.html');
        users = html.insertData(users, user);
        base = html.addInsteadOf(base, users, '$users$')
    }); 
    base = html.addStyle(base, 'users.html');
    
    // Добавляем список языков
    languageStatistics.forEach(language => {
        let languages = html.getHTML('language.html');
        languages = html.insertData(languages, language);
        base = html.addInsteadOf(base, languages, '$languageList$');
    });
    base = html.addStyle(base, 'language.html');
    
    // Добавляем JWT на 5 минут
    let adminJwt = myjwt.createJWT(
        {}, 
        'qOH+n+EowSAa0YIppUIwoaETtUjt/K0hprcNt1Jnup8=', 
        60 * 5
    );
    base = html.insertData(base, {jwt: adminJwt});

    html.returnHTML(base);
} catch (err) {
    console.log('Content-Type: application/json\n');
    console.log('Something went wrong');
    console.log(err);
}
};



exports.POSTadmin = async (postData) => {

    // console.log('Content-Type: application/json\n');
    
    // Если через HTTP не отправлены логин/пароль - кидаем HTTP авторизацию
    console.log('Cache-Control: max-age=0, no-cache');
    if (!process.env.HTTP_AUTHORIZATION) {
        console.log('Status: 401 Unauthorized');
        console.log('WWW-Authenticate: Basic realm="admin"\n');
        return;
    }
    
    
    const adminAuthData = Buffer.from(process.env.HTTP_AUTHORIZATION, 'base64url').toString('utf-8').split(':');
    
    
    
    const con = await connectToDB();
    
    
    // Получаем хеш пароля админа из БД
    let sqlAdminPassword = `
    SELECT adminPassword FROM adminPasswords
    WHERE adminLogin = ?
    `;
    let adminPassword;
    try {
        let adminPasswordInDB = (await con.execute(sqlAdminPassword, [adminAuthData[0]]))[0][0];
        if (adminPasswordInDB) {
            adminPassword = adminPasswordInDB.adminPassword;
        }
    } catch (err) {
        showDBError(con, err);
        return;
    }
    
    
    // Если неправильный логин пароль - кидаем 403
    if (getSHA256(adminAuthData[1]) !== adminPassword) {
        con.end();
        console.log('Status: 403 Forbidden\n');
        return;
    }
    
    
    
    // Парсим параметры из ссылки и из POST данных
    let deleteResponse = {
        deleted: 'true'
    };
    

    
    let adminJwt = postData.token;
    let decodedJwt = myjwt.decodeJWT(adminJwt);
    
    
    // Если нет JWT или он не валидный - возвращаем 403
    if (!adminJwt || !myjwt.isValideJWT(decodedJwt, 'qOH+n+EowSAa0YIppUIwoaETtUjt/K0hprcNt1Jnup8=')) {
        deleteResponse.deleted = 'false';
        console.log('Status: 403');
        console.log('Content-Type: application/json\n');
        con.end();
        return;
    }
    
    

    // Генерируем новый токен на 5 минут
    let newToken = myjwt.createJWT(
        {}, 
        'qOH+n+EowSAa0YIppUIwoaETtUjt/K0hprcNt1Jnup8=', 
        60 * 5
    );
    deleteResponse.newToken = newToken;
    
    

    let sqlDeleteUser = `
    DELETE u, p, ul, jk FROM users u 
    JOIN passwords p ON u.userId = p.userId 
    JOIN userLanguages ul ON u.userId = ul.userId 
    JOIN jwtKeys jk ON u.userId = jk.userId 
    WHERE u.userId=?
    `;
    try {
        
        await con.execute(sqlDeleteUser, [postData.userId]);
        
    } catch (err) {
        deleteResponse.deleted = 'false';
        console.log('Status: 403\n');
        return;
    }



    con.commit();
    con.end();



    if (postData.js === 'disabled') {
        console.log('Location: /web-backend/8/admin/\n');
        return;
    }

    console.log('Content-Type: application/json\n');
    console.log(JSON.stringify(deleteResponse));
    return;
}