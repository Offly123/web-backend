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
    
});