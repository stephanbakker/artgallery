var gallery = (function (gal) {
    
    "use strict";

    // facade for managing fullscreen
    gal.fullscreen = {
        enter : (function () {
            var html = window.document.documentElement;

            return function (callback) {

                if (html.requestFullscreen) {
                    html.requestFullscreen();

                } else if (html.mozRequestFullScreen) {
                    html.mozRequestFullScreen();

                } else if (html.webkitRequestFullScreen) {
                    html.webkitRequestFullScreen();

                } else {
                    // no support
                    return false;
                }

                if (typeof callback === 'function') {
                    callback();
                }

            };
        }()),

        exit : (function () {

            var doc = window.document;

            return function (callback) {
                if (doc.exitFullscreen) {
                    doc.exitFullscreen();
                } else if (doc.mozCancelFullScreen) {
                    doc.mozCancelFullScreen();
                } else if (doc.webkitCancelFullScreen) {
                    doc.webkitCancelFullScreen();
                } else {
                    // no support
                    return false;
                }

                if (typeof callback === 'function') {
                    callback();
                }
            };

        }())

    };

    return gal;

}(gallery || {}));
