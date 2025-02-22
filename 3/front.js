$(document).ready(function() {
  $('label[tabindex="0"]').keypress(function(e){
    e.preventDefault();
    $("#" + $(this).attr("for")).prop("checked", true);
  })

  $("#toggle-languages").click(function() {
    $(".language-list").toggleClass("show-languages");
  });
  $(".language-list").on({
    focusout: function(event) {
      if (!$(event.relatedTarget).closest(".language-list").length) {
        $(".language-list").removeClass("show-languages");
      }
    }
  });
});