$(document).ready(() => {

    $(".gallery").slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [ {
            breakpoint: 901,
            settings: {
                slidesToShow: 1,
                }
            },
        ]
    });    

    function isOpenModal() {
        return window.location.href.match(/#form/);
    }
    
    function historyChange() {
        const elemModal = document.querySelector("#modalForm");
        const modal = bootstrap.Modal.getOrCreateInstance(elemModal);
        if (isOpenModal() == null) {
            modal.hide();
        } else {
            modal.show();
        }
    }
    
    let isPopup = false;
    
    function formAddURL() {
        let currentURL = {
            modal: "true"
        };
        window.history.pushState(currentURL, "", "#form");
    }
    
    function formClearURL() {
        window.history.back();
    }
    
    function saveItem(event) {
        window.localStorage.setItem(event.target.name, event.target.value);
    }
    
    $("#submitForm").click(function() {
        window.localStorage.clear();
    });
    
    $(function(){
        $(".formcarryForm").submit(function(e){
            e.preventDefault();
            var href = $(this).attr("action");
            
            $.ajax({
                type: "POST",
                url: href,
                data: new FormData(this),
                dataType: "json",
                processData: false,
                contentType: false,
                success: function(response){
                    if(response.status == "success"){
                        alert("We received your submission, thank you!");
                    }
                    else if(response.code === 422){
                        alert("Field validation failed");
                        $.each(response.errors, function(key) {
                            $('[name="' + key + '"]').addClass('formcarry-field-error');
                        });
                    }
                    else{
                        alert("An error occured: " + response.message);
                    }
                },
                error: function(jqXHR, textStatus){
                    const errorObject = jqXHR.responseJSON
                    
                    alert("Request failed, " + errorObject.title + ": " + errorObject.message);
                },
                complete: function(){
                }
            });
        });
    }); 
    
    document.getElementById("showFormBtn").addEventListener("click", formAddURL);
    document.getElementById("hideFormBtn").addEventListener("click", formClearURL);
    document.querySelector("form").addEventListener("change", saveItem);
    window.addEventListener("popstate", historyChange);
    historyChange();
});