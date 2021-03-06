var jQuery = require('jquery');

var navigationHandler = require('./handlers/navigation-handler');
var scrollHandler = require('./handlers/scroll-handler');
var googleMapsHandler = require('./handlers/google-maps-handler');

//Slider handlers
var skillsSliderHandler = require('./handlers/skills-slider-handler');

jQuery(document).ready(function () {

    scrollHandler(jQuery);
    navigationHandler(jQuery);
    googleMapsHandler(jQuery);

    skillsSliderHandler(jQuery);

    //Clearing slick carousel styles
    jQuery('.slick-carousel .slick-dots button').text('');
});
