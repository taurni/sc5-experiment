(function(){
    'use strict';
    console.log('hallo from buttons.js');
    // useage https://github.com/SC5/sc5-styleguide#providing-additional-javascript
    // target scope e.originalEvent.detail.elements
    $(window).bind("styleguide:onRendered", function(e) {
        var el = e.originalEvent.detail.elements.find('.button');
       init(el);
    });

    // init funktsioonis saan kasutada production lahenemist koodis
    function init(el){
        var btn = el;
        console.log(btn,btn.length, 'test');
        btn.click(function(e){
            console.log('hallo button from buttons.js file');
            e.preventDefault();
        });
    }

})();