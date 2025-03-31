const fs = require('fs');
const cook = require('./cook.jss');


// Возвращает HTML в виде строки
exports.getHTML = (page) => {
    let currentDir = process.cwd();
    process.chdir('./html');
    try {
        page = fs.readFileSync(page, 'utf-8');
    } catch {
        console.log('Content-Type: application/json\n');
        console.log('file ' + page + ' not found');
    }
    process.chdir(currentDir);
    return page;
}


// Вставляет в base(HTML в виде строки) части template
// (часть head и весь body)
// HTML получает в виде строк
exports.addTemplate = (base, append) => {
    style = getBetween(append, '$headStart$', '$headEnd$');
    body = getBetween(append, '<body>', '</body>');


    base = base.replace('$style$', style);
    base = base.replace('$bodyToAppend$', body);


    return base;
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


// Получает JSON данных (из куков или БД),
// вставляет их в страницу и удаляет неиспользованные флаги
exports.returnHTML = (page, data) => {
    page = cook.cookiesInPage(page, data);
    page = cook.deleteHTMLFlags(page);
    console.log('Content-Type: text/html; charset=utf-8\n');
    console.log(page);
}