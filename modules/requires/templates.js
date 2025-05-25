const fs = require('fs');
const cook = require('./cook.js');


// Возвращает HTML в виде строки
exports.getHTML = (page) => {
    let currentDir = process.cwd();
    process.chdir(process.env.DOCUMENT_ROOT + '/web-backend/html');
    try {
        page = fs.readFileSync(page, 'utf-8');
    } catch (err) {
        console.log('Content-Type: application/json\n');
        console.log('Something went wrong');
    }
    process.chdir(currentDir);
    return page;
}


// Добавляет всё тело к base от выбранного HTML
exports.addBody = (base, appendName) => {
    let append = this.getHTML(appendName);

    let body = getBetween(append, '<body>', '</body>');

    base = base.replace('$bodyToAppend$', body + '\n$bodyToAppend$\n');

    return base;
}


// Добавляет стили из выбранного HTML
exports.addStyle = (base, appendName) => {
    let append = this.getHTML(appendName);

    let style = getBetween(append, '$styleStart$', '$styleEnd$');

    base = base.replace('$style$', style + '$style$');

    return base;
}


// Добавляет к base вместо place весь body
exports.addInsteadOf = (base, append, place) => {
    // let append = this.getHTML(appendName);

    let body = getBetween(append, '<body>', '</body>');

    base = base.replace(place, body);

    return base;
}


// Вставляем все данные JSON в page
exports.insertData = (page, data) => {
    try {
        if (data.constructor !== Object) {
            throw new Error('Only Object type');
        }

        for (let index in data) {
            page = page.replaceAll('$' + index + '$', data[index]);
        }
        
        return page;
    } catch (err) {
        console.log('Content-Type: application/json\n');
        console.log('Something went wrong');
    }
}



// Возвращает часть строки между двумя подстроками не включительно
const getBetween = (string, start, end) => {
    const startIndex = string.indexOf(start);
    const endIndex = string.indexOf(end);

    if (start === -1 || end === -1) {
        return '';
    }

    return string.substring(startIndex + start.length, endIndex);
}


exports.deleteHTMLFlags = (page) => {
    page = page.replace(/\$.*?\$/g, '');
    return page;
}


// Получает JSON данных (из куков или БД),
// вставляет их в страницу и удаляет неиспользованные флаги
exports.returnHTML = (page, data) => {
    if (!data) {
        data = {};
    }
    page = cook.cookiesInPage(page, data);
    page = this.deleteHTMLFlags(page);
    console.log('Content-Type: text/html; charset=utf-8\n');
    // console.log('Content-Type: application/json; charset=utf-8\n');
    console.log(page);
}

// Логин: hDy6T5BUAW

// Пароль: Wd1EttDiMF