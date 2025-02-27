// don't let him cook



// // получает имя печенья и значение, устанавливает на время сессии
// exports.setCookie = (name, value) => {
//   console.log('Set-Cookie: ' + name + '=' + value);  
// }
// // получает имя печенья, значение и секунды на жизнь
// exports.setCookie = (name, value, secondsToLive) => {
//   let timeofDeath = new Date();
//   timeofDeath.setSeconds(timeofDeath.getSeconds() + secondsToLive);
//   console.log('Set-Cookie: ' + name + '=' + value + '; Expires=' + timeofDeath);
// }
exports.setCookie = (...args) => {
  if (args.length == 2) {
    console.log('Set-Cookie: ' + args[0] + '=' + args[1]);
    return;
  }
  let timeofDeath = new Date();
  timeofDeath.setSeconds(timeofDeath.getSeconds() + args[2]);
  console.log('Set-Cookie: ' + args[0] + '=' + args[1] + '; Expires=' + timeofDeath);
}



// получает поля формы в виде JSON и устанавливает значения cookies на год
exports.formDataToCookie = (formData) => {
  for (let index in formData) {
    this.setCookie(index, formData[index], 60 * 60 * 24 * 365);
  }
}



// возвращает JSON, содержащий все cookies
exports.cookiesToJSON = () => {
  let cookieList = {};
  toArray = process.env.HTTP_COOKIE.split("; ");
  toArray.forEach((cook) => {
    cookieList[cook.split("=")[0]] = cook.split("=")[1];
  });
  return cookieList;
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
  
  if (!(/^[0-9]+$/.test(formData.phoneNumber))) {
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

  if (formData.sex == null) {
    this.setCookie('sexError', 'none');
    this.setCookie('sex', '', -1);
    validValue = false;
  } else {
    this.setCookie('sexError', '', -1);
  }

  if (formData.language == undefined) {
    this.setCookie('languageError', 'none');
    this.setCookie('language', '', -1);
    validValue = false;
  } else {
    this.setCookie('languageError', '', -1);
  }

  return validValue;
}



// получает на вход строку (html документ) и переменные с ошибками, после заменяет "переменные" на атрибут style
// чтобы подсветить поля, в которых ошибки
// TODO: поменять принцип работы на изменение "переменных" по печенью
exports.showErrorText = (page, fieldsWithErrors) => {
  fieldsWithErrors.forEach((variableName) => {
    page = page.replace(variableName, 'style="display: block"');
  });
  return page;
}