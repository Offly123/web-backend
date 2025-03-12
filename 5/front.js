$(document).ready(function () {
    // Позволяет выбирать языки табуляцией
    $('label[tabindex="0"]').keypress(function (e) {
        e.preventDefault();
        $("#" + $(this).attr("for")).prop("checked", true);
    });


    $("#toggle-languages").click(function () {
        $(".language-list").toggleClass("show-languages");
    });
    // дальше бога нет
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

    $(".switch-to-registration").click(async (e) =>  {
        e.preventDefault();
        $("#form-login").addClass("hide-form");
        $("#form-login").removeClass("show-form");
        $("#form-registration").addClass("show-form");
        $("#form-registration").removeClass("hide-form");
        setTimeout(() => {
            $("#form-login").addClass("form-hidden");
            $("#form-login").removeClass("form-shown");
            $("#form-registration").addClass("form-shown");
            $("#form-registration").removeClass("form-hidden");
        }, 4000);
    })
    $(".switch-to-login").click((e) =>  {
        e.preventDefault();
        $("#form-registration").removeClass("show-form");
        $("#form-registration").addClass("hide-form");
        $("#form-login").removeClass("hide-form");
        $("#form-login").addClass("show-form");
    })
});