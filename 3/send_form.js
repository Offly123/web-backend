$(document).ready(function() {
  $("#form").submit(function(e) {
    e.preventDefault();
    var dataToSend = $(this).serialize();
    $.ajax(
    {
      type: "POST",
      url: "form_handler.jss",
      data: dataToSend,
      success: function(response) {
        alert("123");
      },
      error: function(err) {
        alert(err.responseText);
      },
    });
  })
})