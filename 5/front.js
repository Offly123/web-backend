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
                $(event.relatedTarget)[0].className != "dont-close"))
                $(".language-list").removeClass("show-languages");
        }
    });
    $(document).click(function (event) {
        if ($(event.target)[0] == undefined ||
            ($(event.target)[0].className != "dont-close")) {
            $(".language-list").removeClass("show-languages");
        }
    });


    // По нажатию кнопок меняет отображаемую форму
    let login = $("#form-login");
    let registration = $("#form-registration");

    $(".switch-to-registration").click(async (e) =>  {
        e.preventDefault();
        disableButtons();
        animateHideShow(login, registration);
        setTimeout(() => {
            hideShowForm(login, registration);
            this.disabled = false;
        }, 700);

    });

    $(".switch-to-login").click((e) =>  {
        e.preventDefault();
        disableButtons();
        animateHideShow(registration, login);
        setTimeout(() => {
            hideShowForm(registration, login);
            this.disabled = false;
        }, 700);
    });

    $("#close-popup").click((e) => {
        e.preventDefault();
        $("#popup-success").addClass("success-hide");
    })
});


// Уводит влево форму hide и выводит справа форму show
function animateHideShow(hide, show) {
    $(hide).addClass("hide-form");
    $(hide).removeClass("show-form");
    $(show).addClass("show-form");
    $(show).removeClass("hide-form");
}


// Скрывает форму hide и показывает форму show
function hideShowForm(hide, show) {
    $(hide).addClass("form-hidden");
    $(hide).removeClass("form-shown");
    $(show).addClass("form-shown");
    $(show).removeClass("form-hidden");
}

// Отключает кнопку на время анимации
function disableButtons() {
    $(".switch-to-registration")[0].disabled = true;
    $(".switch-to-login")[0].disabled = true;
    setTimeout(() => {
        $(".switch-to-registration")[0].disabled = false;
    $(".switch-to-login")[0].disabled = false;
    }, 700);
}