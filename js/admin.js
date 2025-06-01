window.addEventListener("DOMContentLoaded", () => {

    // При нажатии кнопки удаляем пользователя
    let deleteButtonList = document.querySelectorAll('form');
    deleteButtonList.forEach((form) => {
        form.addEventListener('submit', deleteUser);
    });

});

const deleteUser = async (e) => {
    e.preventDefault();
    const form = e.target;

    // Получаем userId и token из вызванной формы
    const userId = form.querySelector('[name=userId]').value;
    let dataToSent = new URLSearchParams( new FormData(form)).toString();
    // console.log(dataToSent);


    // Отправляем fetch
    const url = './8/admin/';
    let response = await fetch(url, {
        method: 'POST',
        body: dataToSent
    });


    // Получаем ответ сервера
    let fetchData = await response.json();


    // Если что-то не так - кидаем ошибку
    if (!response.ok || fetchData.deleted !== 'true') {
        console.error('Ошибка');
        console.log(fetchData);
        return;
    }


    // Устанавливаем новый JWT
    document.querySelector('[name=token]').content = fetchData.newToken;


    // Удаляем карточку пользователя нажатой кнопки
    e.target.closest('.user-info').remove();
};