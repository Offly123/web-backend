'use strict';


// Закрыть окно успешной регистрации
$(document).ready(function () {

    $("#close-popup").click((e) => {
        e.preventDefault();
        $("#popup-error").addClass("error-hide");
    })

});