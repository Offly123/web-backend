// Модуль для обработки данных из HTTP 
// (типа POST, параметры в ссылке и прочее)


// Возвращает все параметры из ссылки
export function getLinkParams() {
    let linkParams = process.env.QUERY_STRING.split('&');
    
    let params = {};
    linkParams.forEach(param => {
        params[param.split('=')[0]] = param.split('=')[1];
    });

    return params;
}


// Получает строку с параметрами и возвращает их 
// в виде JSON
export function parseURLEncodedData(URLEndodedData) {
    // Убираем лишний undefined в начале (я не знаю откуда он)
    URLEndodedData = URLEndodedData.replace('undefined', '');


    // Разбиваем сначала по '&', а потом по '='
    let paramValuePairs = URLEndodedData.split('&');

    let params = {};
    paramValuePairs.forEach(param => {
        params[param.split('=')[0]] = param.split('=')[1];
    });
    
    
    return params;
}