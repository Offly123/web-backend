const fs = require('fs');
const cook = require('./cook.jss');


// Возвращает HTML в виде строки
exports.getHTML = (page) => {
    let currentDir = process.cwd();
    process.chdir(process.env.DOCUMENT_ROOT + '/web-backend/6/html');
    try {
        page = fs.readFileSync(page, 'utf-8');
    } catch {
        console.log('Content-Type: application/json\n');
        console.log('file ' + page + ' not found');
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


// Все данные массива JSON или JSON в page
exports.insertData = (page, data) => {
    try {
        // console.log(data);
        if (data.constructor !== Array) {
            data = [data];
        }
        
        data.forEach(element => {
            // console.log(element);
            if (element.constructor !== Object) {
                throw new Error('Only Array:Object or Object type');
            }
            
            for (let index in element) {
                // console.log(index);
                page = page.replace('$' + index + '$', element[index]);
                page = page.replace('$' + data[index] + '$', element[index]);
            }
        });
        
        return page;
    } catch (err) {
        console.log('Content-Type: application/json\n');
        console.log(err);
    }
}


// Возвращает часть строки между двумя подстроками не включительно
const getBetween = (string, start, end) => {
    startIndex = string.indexOf(start);
    endIndex = string.indexOf(end);

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