// получает поля формы и устанавливает значения cookies
exports.setCookies = (formData) => {
  let currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() + 1);
  for (let index in formData) {
    console.log('Set-Cookie: ' + index + '=' + formData[index] + '; Expires=' + currentDate.toGMTString());
  }
}

// возвращает JSON, содержащий все cookies
exports.cookiesToArray = () => {
  let toArray = process.env.HTTP_COOKIE.split("; ");
  let cookieList = {};
  toArray.forEach((cook) => {
    cookieList[cook.split("=")[0]] = cook.split("=")[1];
  });
  return cookieList;
}

// проверяет правильность введённых значений, возвращает имена "переменных", которые надо подставить в HTML
exports.validateValues = (cookieList) => {
  if (cookieList.fullName.length > 150) {
    return false;
  }
  
  if (!(/^[А-Яа-яЁё\s]+$/.test(cookieList.fullName))) {
    return false;
  }

  if (!(/^[0-9\s]+$/.test(cookieList.phone))) {
    return false;
  }

  if (cookieList.sex == null) {
    return false;
  }

  if (cookieList.language == undefined) {
    return false;
  }

  return true;
}