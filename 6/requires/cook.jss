// don't let him cook

const fs = require('fs');


// Если два аргумента - ставит печенье на сессию (до закрытия браузера)
// Если три, и третий это:
//      Число  - ставит на указанное кол-во секунд
//      Строка - ставит для указанной страницы
// Если четрые:
//      Третий аргумент    - время
//      Четвёртый аргумент - путь
exports.setCookie = (...args) => {
    if (args.length === 2) {
        console.log('Set-Cookie: ' + args[0] + '=' + args[1] + '; path=/web-backend/6/; httponly');
        return;
    }
    if (args.length === 3) {
        if (args[2].constructor === Number) {

            let timeofDeath = new Date();
            timeofDeath.setSeconds(timeofDeath.getSeconds() + args[2]);
            console.log('Set-Cookie: ' + args[0] + '=' + args[1] + '; path=/web-backend/6/; Expires=' + timeofDeath + '; httponly');

            return;
        }

        console.log('Set-Cookie: ' + args[0] + '=' + args[1] + '; path=/web-backend/6/' + args[2] + '; httponly');

        return;
    }
    let timeofDeath = new Date();
    timeofDeath.setSeconds(timeofDeath.getSeconds() + args[2]);
    console.log('Set-Cookie: ' + args[0] + '=' + args[1] + '; path=/web-backend/6/' + args[3] + '; Expires=' + timeofDeath + '; httponly');
}


// получает поля формы в виде объекта и устанавливает значения cookies на год
exports.formDataToCookie = (postData) => {
    for (let index in postData) {
        this.setCookie(index, postData[index]);
    }
}


// Возвращает объект, содержащий все cookies
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
exports.deleteRegistrationData = () => {
    let cooks = this.cookiesToJSON();
    for (cookie in cooks) {
        if (cookie === 'session' || cookie === 'dataSend') {
            continue;
        }
        this.setCookie(cookie, '', -1);
    }
}


// получает данные формы в виде JSON
// Если какое-либо значение кривое - добавляет в куки ошибку и
// возвращает false,
// Иначе возвращает true
exports.checkValues = (formData) => {
    let validValues = true;
    if (!(/^[А-Яа-яЁё\s]+$/.test(formData.fullName)) || formData.fullName.length > 150) {
        this.setCookie('fullNameError', formData.fullName);
        validValues = false;
    } else {
        this.setCookie('fullNameError', '', -1);
    }


    if (!(/^[0-9]+$/.test(formData.phoneNumber)) || formData.phoneNumber.length > 15) {
        this.setCookie('phoneNumberError', formData.phoneNumber);
        validValues = false;
    } else {
        this.setCookie('phoneNumberError', '', -1);
    }


    if (!(/^[0-9a-zA-Z\-_]+@[0-9a-zA-Z\-_]+\.[a-z]+$/.test(formData.emailAddress)) || formData.emailAddress.length > 50) {
        this.setCookie('emailAddressError', formData.emailAddress);
        validValues = false;
    } else {
        this.setCookie('emailAddressError', '', -1);
    }


    if (!(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(formData.birthDate))) {
        let birthYear = formData.birthDate.split('-')[0];
        let currentYear = new Date().getFullYear();
        if (birthYear < 1900 || birthYear > currentYear) {
            this.setCookie('birthDateError', formData.birthDate);
            validValues = false;
        }
    } else {
        this.setCookie('birthDateError', '', -1);
    }


    if (formData.sex !== 'Male' && formData.sex !== 'Female') {
        this.setCookie('sexError', 'none');
        validValues = false;
    } else {
        this.setCookie('sexError', '', -1);
    }


    if (formData.language === undefined) {
        this.setCookie('languageError', 'none');
        validValues = false;
    } else {
        this.setCookie('languageError', '', -1);
        
        if (formData.language.constructor != Array) {
            formData.language = [formData.language];
        }
        formData.language.forEach((language) => {
            if (language < 1 || language > 12) {
                this.setCookie('languageError', 'none');
                validValues = false;
            } else {
                this.setCookie('languageError', '', -1);
            }
        });
    }


    if (!(/^[А-Яа-яЁёa-zA-Z\.,\s]+$/.test(formData.biography)) || formData.biography.length > 150) {
        this.setCookie('biographyError', 'hehe');
        validValues = false;
    } else {
        this.setCookie('biographyError', '', -1);
    }


    return validValues;
}


// Напрямую подставляет значение в HTML
const insertDirectly = (page, cookieName, data) => {
    if (data) {
        data = data.replace(/<.*?>/g, '');
    }
    if (data == undefined) {
        return page;
    }

    page = page.replace('$' + cookieName + '$', data);
    return page;
}


// Вставляет значение куки в атрибут value
const insertValue = (page, cookieName, data) => {
    if (data == undefined) {   
        return page;
    }

    page = page.replace('$' + cookieName + '$', 'value="' + data + '"');
    return page;
}


// Добавляет атрибут checked по cookie
const insertChecked = (page, cookieName, data) => {
    if (data == undefined) {
        return page;
    }

    if (cookieName === 'sex') {
        page = page.replace('$' + cookieName + data + '$', 'checked');
        return page;
    }

    if (cookieName === 'language') {
        if (data.constructor !== Array) {
            data = [data];
        }
        data.forEach(languageId => {
            page = page.replace('$language' + languageId + '$', 'checked');
        });
        return page;
    }

    page = page.replace('$' + cookieName + '$', 'checked');
    return page;
}


// Подсвечивает ошибки по имени cookie
const showError = (page, cookieName) => {
    page = page.replace('$' + cookieName + '$', 'style="display: block"');
    page = page.replace('$' + cookieName + 'Border$', 'style="border: 1px solid red"');
    return page;
}


// получает HTML страницу в виде строки и JSON данных, которые надо вставить.
// Заменяет $$ на соответствующие значения cookie
exports.cookiesInPage = (page, allData) => {
    const cookiesToInsertValue = [
        'fullName', 'phoneNumber', 'emailAddress', 'birthDate'
    ];
    const cookiesToInsertChecked = [
        'sex', 'language', 'agreement'
    ];
    const cookiesToInsertDirectly = [
        'biography', 'userLogin'
    ];
    
    // Вставляем значения, которые в HTML атрибуте value
    cookiesToInsertValue.forEach((valueCookie) => {
        page = insertValue(page, valueCookie, allData[valueCookie]);
    });
    
    // Вставляем вместо $$ checked
    cookiesToInsertChecked.forEach((checkedCookie) => {
        page = insertChecked(page, checkedCookie, allData[checkedCookie]);
    });
    
    // Напрямую вставляем значения cookie
    cookiesToInsertDirectly.forEach((directlyCookie) => {
        page = insertDirectly(page, directlyCookie, allData[directlyCookie])
    });
    
    // Если в имени есть Error, подсвечиваем ошибки
    // console.log(allData);
    for (let errorCookie in allData) {
        if (errorCookie.includes('Error')) {
            page = showError(page, errorCookie);
        }
    }
    
    
    let auth;
    let login;
    let password;
    
    
    // Чтение сгенерированных логина и пароля из файла
    try {
        auth = fs.readFileSync('../auth.txt', 'utf8').split(';');
        fs.writeFileSync('../auth.txt', '');
    } catch (err) {
        console.log('Content-Type: application/json\n');
        console.log(process.cwd());
        console.log(err);
    }
    
    if (auth != undefined) {
        login = auth[0];
        password = auth[1];
    }
    

    // Высвечиваем сообщение об ошибке или успехе, также
    // заменяем $$ на сгенерированыне логин и пароль
    page = page.replace('$animateSuccess$', 'class="success-show"');
    page = page.replace('$login$', login);
    page = page.replace('$password$', password);
    page = page.replace('$animateError$', 'class="error-show"');

    return page;
}


exports.generateString = (length) => {
    let string = '';
    let symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
        string += symbols[Math.floor(Math.random() * symbols.length)];
    }
    return string;
}
