
const mysql = require('mysql2/promise');

// Откатывает транзакцию, закрывает соединение и возвращает 
// пользователю ошибку
exports.showDBError = (con, err) => {
    con.rollback();
    con.end();
    console.log('Content-Type: application/json\n');
    console.log('Ошибка в БД:\n', err);
}


// Получает ответ от БД и возвращает данные пользователя в JSON
exports.DBDataToJSON = (personalData, languages) => {
    let data;

    data = personalData[0][0];
    data.language = [];
    if (languages.constructor !== Array) {
        languages = [languages];
    }

    languages[0].forEach(lang => {
        data.language.push(lang.languageId);
    });

    
    data.birthDate = data.birthDate.toISOString().substr(0, 10);

    return data;
}

exports.connectToDB = async () => {
    let con;

    try {
        con = mysql.createConnection({
            host: process.env.DBHOST,
            user: process.env.DBUSER,
            password: process.env.DBPSWD,
            database: process.env.DBNAME
        });
    } catch (err) {
        console.log('Content-Type: application/json\n');
        console.log(err);
    }

    return con;
}


exports.validateHTTPAuth = async () => {
    
}