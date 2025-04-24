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
    userId = userId.replace(/(\r\n)?\s?/g, '');

    const url = `./admin/?query=delete&userId=${userId}`;
    console.log(url);

    let response = await fetch(`./admin/?query=delete&userId=${userId}`);

    let fetchData = await response.json();
    console.log(fetchData);

    if (!response.ok || fetchData.deleted !== 'true') {
        alert('Ошибка при удалении, свяжитесь сами с собой');
        return;
    }

    e.target.closest('.user-info').remove();
    
};