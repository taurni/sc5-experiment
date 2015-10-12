(function(){
    'use strict';
    console.log('hallo from buttons.js');
    // useage https://github.com/SC5/sc5-styleguide#providing-additional-javascript
    // target scope e.originalEvent.detail.elements
    var p = 0;
    $(window).bind("styleguide:onRendered", function(e) {
        console.log('onrendered:',p,e.originalEvent.detail.elements.find('.button'));
        p++;
        //var btn = document.querySelectorAll('.button');
        var btn = $('.button');
        e.originalEvent.detail.elements.find('.button').click(function(e){
            console.log('hallo button from buttons.js file');
            e.preventDefault();
        });
    });

})();