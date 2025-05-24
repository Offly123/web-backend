$(document).ready(function() {
    $(".companies-gallery").slick({
        speed: 4000,
        cssEase: 'ease-in-out',
        pauseOnHover: false,
        pauseOnDotsHover: false,
        pauseOnFocus: false,
        swipe: false,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1000,
        arrows: false,
        responsive: [ {
            breakpoint: 901,
            settings: {
                slidesToShow: 2,
                }
            },
        ]
    });    
});
