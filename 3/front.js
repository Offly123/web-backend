$(document).ready(function() {
  $('label[tabindex="0"]').keypress(function(e){
    e.preventDefault();
    $("#" + $(this).attr("for")).prop("checked", true);
  })


  $("#toggle-languages").click(function() {
    $(".language-list").toggleClass("show-languages");
  });
  // дальше бога нет
  $(".language-list").on({
    focusout: function(event) {
      if ($(event.relatedTarget)[0] == undefined ||
         ($(event.relatedTarget)[0].className != "language-label" &&
          $(event.relatedTarget)[0].className != "dont-close"))
        $(".language-list").removeClass("show-languages");
    }
  });
  $(document).click(function(event) {
    if ($(event.target)[0] == undefined ||
       ($(event.target)[0].className != "dont-close")) {
         $(".language-list").removeClass("show-languages");
    }
  })
});