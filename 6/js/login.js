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

    $(".switch-to-registration").click((e) =>  {
        e.preventDefault();
        switchForm(login, registration, this);
    });

    $(".switch-to-login").click((e) =>  {
        e.preventDefault();
        switchForm(registration, login, this);
    });



    $("#close-popup").click((e) => {
        e.preventDefault();
        $("#popup-success").addClass("success-hide");
    })
});