'use strict';

$(document).ready(function () {
    // Позволяет выбирать языки табуляцией
    $('label[tabindex="0"]').keypress(function (e) {
        e.preventDefault();
        $("#" + $(this).attr("for")).prop("checked", true);
    });


    // Показывает/скрывает список языков
    $("#toggle-languages").click(function () {
        $(".language-list").toggleClass("show-languages");
    });

    $(".language-list").on({
        focusout: function (event) {
            if ($(event.relatedTarget)[0] == undefined ||
               ($(event.relatedTarget)[0].className != "language-label" &&
                $(event.relatedTarget)[0].className != "dont-close"
            )) {
                $(".language-list").removeClass("show-languages");
            }
        }
    });
    
    $(document).click(function (event) {
        if ($(event.target)[0] == undefined ||
           ($(event.target)[0].className != "dont-close"
        )) {
            $(".language-list").removeClass("show-languages");
        }
    });

    const formElement = document.querySelector('form');
    const sendButton = document.querySelector('.submit-btn');
    sendButton.addEventListener('click', (e) => { handleFormSend(e, formElement) });
});



const handleFormSend = async (e, formElement) => {
    e.preventDefault();

    const errorList = checkValues(new FormData(formElement));
    highlightErrors(errorList);
    if (errorList.length) {
        // console.log(errorList);
        return;
    }


    const dataToSend = new URLSearchParams(new FormData(formElement)).toString();
    // console.log(dataToSend);
    
    const url = './8/profile/';
    const response = await fetch(url, {
        method: 'POST',
        body: dataToSend
    });

    if (!response.ok) {
        console.log('Ошибка');
    }

    const responseErrorList = await response.json();

    if (!responseErrorList.length) {
        alert('Данные успешно обновлены');
    }
    
}



const checkValues = (formElement) => {
    let errorList = [];
    if (!(/^[А-Яа-яЁё\s]+$/.test(formElement.get('fullName'))) || formElement.get('fullName').length > 150) {
        errorList.push('fullName');
    }


    if (!(/^[0-9]+$/.test(formElement.get('phoneNumber'))) || formElement.get('phoneNumber').length > 15) {
        errorList.push('phoneNumber');
    }


    if (!(/^[0-9a-zA-Z\-_]+@[0-9a-zA-Z\-_]+\.[a-z]+$/.test(formElement.get('emailAddress'))) || formElement.get('emailAddress').length > 50) {
        errorList.push('emailAddress');
    }

    let birthYear = formElement.get('birthDate')?.split('-')[0];
    let currentYear = new Date().getFullYear();
    if (!(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(formElement.get('birthDate'))) || birthYear < 1900 || birthYear > currentYear) {
        errorList.push('birthDate');
    } 


    if (formElement.get('sex') !== 'Male' && formElement.get('sex') !== 'Female') {
        errorList.push('sex');
    }

    if (!formElement.getAll('language').length ) {
        errorList.push('language');
    } else {
        formElement.getAll('language').forEach((language) => {
            if (language < 1 || language > 12) {
    
                errorList.push('language');
            } else {
    
            }
        });
    }


    // Валидация биографии
    if (!formElement.get('biography') || 
        !(/^[А-Яа-яЁёa-zA-Z0-9\.,\s]+$/.test(formElement.get('biography'))) || 
        formElement.get('biography').length > 150
    ) {
        errorList.push('biography');
    }


    return errorList;
}



const highlightErrors = (errorList) => {

    const HTMLElements = getHTMLElements();
    Object.keys(HTMLElements).forEach(element => {
        if (errorList.includes(element)) {
            if (element !== 'sex') {
                HTMLElements[element].border.style.border = '1px solid red';
                HTMLElements[element].text.style.display = 'block';
            } else {
                HTMLElements[element].border.forEach(yo => {
                    yo.style.border = '1px solid red';
                });
                HTMLElements[element].text.style.display = 'block';
            }
        } else {
            if (element !== 'sex') {
                HTMLElements[element].border.style.border = '1px solid black';
                HTMLElements[element].text.style.display = 'none';
            } else {
                HTMLElements[element].border.forEach(yo => {
                    yo.style.border = '1px solid black';
                });
                HTMLElements[element].text.style.display = 'none';
            }   
        }
    });
}



const getHTMLElements = () => {
    const formElement = document.querySelector('form');
    let HTMLElements = {};

    HTMLElements.fullName = {
        border: formElement.querySelector('input[name=fullName]'),
        text: formElement.querySelector('.element:has(input[name=fullName]) > p'),
    }

    HTMLElements.phoneNumber = {
        border: formElement.querySelector('input[name=phoneNumber]'),
        text: formElement.querySelector('.element:has(input[name=phoneNumber]) > p'),
    }

    HTMLElements.emailAddress = {
        border: formElement.querySelector('input[name=emailAddress]'),
        text: formElement.querySelector('.element:has(input[name=emailAddress]) > p'),
    }

    HTMLElements.birthDate = {
        border: formElement.querySelector('input[name=birthDate]'),
        text: formElement.querySelector('.element:has(input[name=birthDate]) > p'),
    }

    HTMLElements.sex = {
        border: formElement.querySelectorAll('.radio-buttons-wrapper, .btn-wrapper'),
        text: formElement.querySelector('.error-text-sex'),
    }

    HTMLElements.language = {
        border: formElement.querySelector('.languages > label'),
        text: formElement.querySelector('.languages > label > p'),
    }

    HTMLElements.biography = {
        border: formElement.querySelector('#biography > textarea'),
        text: formElement.querySelector('#biography > p'),
    }

    // console.log(HTMLElements);

    return HTMLElements;
}

// Логин: kYr9dbjV8R

// Пароль: ZBVD9sPThH