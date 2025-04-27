window.addEventListener("DOMContentLoaded", () => {

    // При нажатии кнопки удаляем пользователя
    let deleteButtonList = document.querySelectorAll('.deleteUser');
    deleteButtonList.forEach((button) => {
        button.addEventListener('click', deleteUser);
    });

});

const deleteUser = async (e) => {
    e.preventDefault();

    // Получение userId
    let userId = e.target.closest('.user-info').children['0'].children['1'].innerHTML;
    // Удаляем возможные лишние пробелы и символы новой строки
    userId = userId.replace(/(\r\n)?\s?/g, '');


    // Считываем токен из meta и отправляем fetch
    const tokenMeta = document.querySelector('[name=adminToken]')
    const token = tokenMeta.getAttribute('content');
    const url = `./admin/?query=delete`;
    let response = await fetch(url, {
        method: 'DELETE',
        body: JSON.stringify({
            token: token,
            userId: userId
        })
    });


    // Получаем ответ сервера
    let fetchData = await response.json();

    // Если что-то не так - кидаем ошибку
    if (!response.ok || fetchData.deleted !== 'true') {
        alert('Ошибка при удалении, свяжитесь сами с собой, потому что вы админ');
        return;
    }

    // Устанавливаем новый JWT
    tokenMeta.setAttribute('content', fetchData.newToken);

    // Удаляем карточку пользователя нажатой кнопки
    e.target.closest('.user-info').remove();
};