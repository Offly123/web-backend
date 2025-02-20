$(document).ready(function() {
  $("#form").submit(function(e) {
    e.preventDefault();
    var dataToSend = $(this).serialize();
    $.ajax(
    {
      type: "POST",
      url: "form_handler.jss",
      data: dataToSend,
      success: (res) => {
          console.log(res + " row inserted succesfully");
      },
      error: (err) => {
        console.log("ERROR");
        console.log(err.responseText);
      }
    });
  })

})