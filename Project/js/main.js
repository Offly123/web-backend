$(document).ready(function() {
    $(".dropdown").mouseenter(function() {
        $(".dropdown-wrapper").addClass("showDropdown");
        $(".dropdown-wrapper").removeClass("hideDropdown");
    });
    $(".dropdown").mouseleave(function() {
        $(".dropdown-wrapper").addClass("hideDropdown");
        $(".dropdown-wrapper").removeClass("showDropdown");
    });

    $(".menuMobileItem").hide();
    $("#menuMobileButton").click(function() {
        $(".menuMobileItem").toggle();
    });
});
