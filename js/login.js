'use strict';

$(document).ready(function () {
    $("#close-popup").click((e) => {
        e.preventDefault();
        $("#popup-success").addClass("success-hide");
    })
});