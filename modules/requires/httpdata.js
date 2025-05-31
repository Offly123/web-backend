// Модуль для обработки данных из HTTP 
// (типа POST, параметры в ссылке и прочее)


// Возвращает все параметры из ссылки
exports.getLinkParams = () => {
    let linkParams = process.env.QUERY_STRING.split('&');
    
    let params = {};
    linkParams.forEach(param => {
        params[param.split('=')[0]] = param.split('=')[1];
    });
    
    return params;
}


// Получает строку с параметрами и возвращает их 
// в виде JSON
exports.parseURLEncodedData = (URLEndodedData) => {
    // Убираем лишний undefined в начале (я не знаю откуда он)
    URLEndodedData = URLEndodedData.replace('undefined', '');

    let paramValuePairs = URLEndodedData.split('&');

    let params = {};
    paramValuePairs.forEach(param => {
        const key = param.split('=')[0];
        const value = decodeURIComponent(param.split('=')[1]).replaceAll('+', ' ');
        // console.log('key = ' + key);
        // console.log('value = ' + value);
        
        // Если нет такого ключа - просто добавляем
        // Если есть, и значение одно - пихаем в массив
        // Иначе просто расширяем массив
        if (params[key]) {
            if (params[key] instanceof Array) {
                params[key] = [...params[key], value];
            } else {
                params[key] = [params[key], value];
            }
        } else {
            params[key] = value;
        }
    });
    
    
    return params;
}
