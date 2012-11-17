/*global window, document, console, $ */
var gallery = (function (gal) {

    "use strict";

    gal.init = function (galTmplId, imgTmplId, root) {

        // assign in closure scope
        gal.$root = root || $('.gal');

        // dependency check for jquery
        if (!$) {
            if (window.console) {
                console.log('needs jquery');
            }
            return;
        }

        // create collection methods
        gal.collection = gal.createCollection();

        // create gallery methods
        gal.controls = gal.prepareGallery(galTmplId, imgTmplId);

        // init user events
        gal.initLaunchEvent();

    };

    return gal;

}(gallery || {}));



