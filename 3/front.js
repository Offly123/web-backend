$(document).ready(function() {
  $('label[tabindex="0"]').keypress(function(e){
    e.preventDefault();
    $("#" + $(this).attr("for")).prop("checked", true);
  })
});