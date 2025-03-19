// don't let him cook

const fs = require('fs');


// получает имя, значение и время в секундах
exports.setCookie = (...args) => {
    if (args.length === 2) {
        console.log('Set-Cookie: ' + args[0] + '=' + args[1] + '; path=/web-backend/5/; httponly');
        return;
    }
    let timeofDeath = new Date();
    timeofDeath.setSeconds(timeofDeath.getSeconds() + args[2]);
    console.log('Set-Cookie: ' + args[0] + '=' + args[1] + '; path=/web-backend/5/; Expires=' + timeofDeath + '; httponly');
}


// получает поля формы в виде JSON и устанавливает значения cookies на год
exports.formDataToCookie = (formData) => {
    for (let index in formData) {
        this.setCookie(index, formData[index], 60 * 60 * 24 * 365);
    }
    this.setCookie('dataSend', 'false');
}


// Возвращает JSON, содержащий все cookies
exports.cookiesToJSON = () => {
    let cookieList = {};
    if (process.env.HTTP_COOKIE === undefined) {
        return cookieList;
    }
    toArray = process.env.HTTP_COOKIE.split("; ");
    toArray.forEach((cook) => {
        cookieList[cook.split("=")[0]] = cook.split("=")[1];
    });
    return cookieList;
}


// Удаляет все куки кроме session
// (после успешной регистрации личные данные надо удалить
// чтобы их нельзя было украсть)
exports.deleteRegistrationData = () => {
    let cooks = this.cookiesToJSON();
    for (cookie in cooks) {
        if (cookie === 'session' || cookie === 'dataSend') {
            continue;
        }
        this.setCookie(cookie, '', -1);
    }
}


// получает данные формы в виде JSON, меняет <Имя> печенья на <Имя>Error, 
// если значение плохое
exports.checkValues = (formData) => {
    let validValue = true;
    if (!(/^[А-Яа-яЁё\s]+$/.test(formData.fullName)) || formData.fullName.length > 150) {
        this.setCookie('fullNameError', formData.fullName);
        this.setCookie('fullName', '', -1);
        validValue = false;
    } else {
        this.setCookie('fullNameError', '', -1);
    }

    if (!(/^[0-9]+$/.test(formData.phoneNumber)) || formData.phoneNumber.length > 15) {
        this.setCookie('phoneNumberError', formData.phoneNumber);
        this.setCookie('phoneNumber', '', -1);
        validValue = false;
    } else {
        this.setCookie('phoneNumberError', '', -1);
    }

    let birthYear = formData.birthDate.split('-');
    if (birthYear[0] < 1900) {
        this.setCookie('birthDateError', formData.birthDate);
        this.setCookie('birthDate', '', -1);
        validValue = false;
    } else {
        this.setCookie('birthDateError', '', -1);
    }

    if (formData.sex === null) {
        this.setCookie('sexError', 'none');
        this.setCookie('sex', '', -1);
        validValue = false;
    } else {
        this.setCookie('sexError', '', -1);
    }

    if (formData.language === undefined) {
        this.setCookie('languageError', 'none');
        this.setCookie('language', '', -1);
        validValue = false;
    } else {
        this.setCookie('languageError', '', -1);
    }

    return validValue;
}


// получает HTML страницу в виде строки, значение из cookies вставляет в форму, если есть 
// ошибки, то подсвечивает
exports.cookiesInPage = (page) => {
    const cookieValues = this.cookiesToJSON();
    let anyErrors = false;
    
    for (let cookieName in cookieValues) {
        
        // оставь надежду всяк сюда входящий
        
        if (cookieName.search("Error") != -1) {
            page = this.ShowError(page, cookieName);
            this.setCookie('dataSend', 'false');
            anyErrors = true;
        }
        
        if (cookieName === 'biography') {
            page = page.replace('$' + cookieName + '$', cookieValues[cookieName]);
        }
        
        if (cookieName === 'sex') {
            if (cookieValues[cookieName] === 'male') {
                page = page.replace('$sexMale$', 'checked');
            } else {
                page = page.replace('$sexFemale$', 'checked');
            }
        }
        
        if (cookieName === 'language') {
            let languageArray = cookieValues[cookieName].split(",");
            languageArray.forEach((langId) => {
                page = page.replace('$language' + langId + '$', 'checked');
            });
        }
        cookieNameWithoutError = cookieName.replace('Error', '');
        page = page.replace('$' + cookieNameWithoutError + '$', 'value="' + cookieValues[cookieName] + '"');
    }
    
    
    // Если данные отправлены впервые и нет ошибок
    if (!anyErrors && cookieValues.dataSend != 'true' && cookieValues.dataSend != undefined) {
        this.setCookie('dataSend', 'true', 60 * 60 * 24 * 365);

        // Чтение сгенерированных данных из файла
        let auth;
        process.chdir('./cgi');
        try {
            auth = fs.readFileSync('auth.txt', 'utf8').split(';');
        } catch (err) {
            console.log('Content-Type: application/json\n');
            console.log(err);
        }
        fs.writeFileSync('auth.txt', '');
        let login = auth[0];
        let password = auth[1];

        page = page.replace('$animateSuccess$', 'class="success-show"');
        page = page.replace('$login$', login);
        page = page.replace('$password$', password);    
    }
    
    
    return page;
}


exports.deleteHTMLFlags = (page) => {
    page = page.replace(/\$.*?\$/g, '');
    return page;
}


// подсвечивает ошибки по имени cookie
exports.ShowError = (page, cookieName) => {
    page = page.replace('$' + cookieName + '$', 'style="display: block"');
    page = page.replace('$' + cookieName + 'Border$', 'style="border: 1px solid red"');
    return page;
}


// Генерирует случайную строку длиной 10
exports.generateString = () => {
    let string = '';
    let symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 10; i++) {
        string += symbols[Math.floor(Math.random() * symbols.length)];
    }
    return string;
}