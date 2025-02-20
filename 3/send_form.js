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
        if (response) {
          console.log(response);
        } else {
          console.log("Error");
        }
      },
      error: function(err) {
        console.log(err.responseText);
      },
    });
  })

})