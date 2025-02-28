// don't let him cook


// получает имя, значение и время в секундах
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
  if (process.env.HTTP_COOKIE == undefined) {
    return cookieList;
  }
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



// печенье вставляет в форму
exports.cookiesInForm = (page) => {
  const cookieValues = this.cookiesToJSON();
  for (let cookieName in cookieValues) {
    // оставь надежду всяк сюда входящий
    if (cookieName.search("Error") != -1) {
      page = this.ShowError(page, cookieName);
    }
    if (cookieName == 'biography') {
      page = page.replace('$' + cookieName + '$', cookieValues[cookieName]);
    }
    if (cookieName == 'sex') {
      if (cookieValues[cookieName] == 'male') {
        page = page.replace('$sexMale$', 'checked');
      } else {
        page = page.replace('$sexFemale$', 'checked');
      }
    }
    if (cookieName == 'language') {
      let languageArray = cookieValues[cookieName].split(",");
      languageArray.forEach((langId) => {
        page = page.replace('$language' + langId + '$', 'checked');
      });
    }
    cookieNameWithoutError = cookieName.replace('Error', '');
    page = page.replace('$' + cookieNameWithoutError + '$', 'value="' + cookieValues[cookieName] + '"');
  }
  page = page.replace('$biography$', '');
  return page;
}


exports.ShowError = (page, cookieName) => {
  page = page.replace('$'+ cookieName + '$', 'style="display: block"');
  page = page.replace('$'+ cookieName + 'Border$', 'style="border: 1px solid red"');
  return page;
}