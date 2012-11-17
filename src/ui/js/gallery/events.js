/*global window, document, $, Modernizr*/
var gallery = (function (gal) {

    "use strict";

    var $body = $('body'),
        $root = gal.$root,
        hasFullscreen = false,
        resizeTimer,
        keys = {
            'left': 37,
            'right': 39,
            'escape': 27
        };

    // click events on body
    function handleClicks(e) {
        e.preventDefault();

        var $this = $(e.currentTarget);

        if ($this.hasClass('galnext')) {
            gal.controls.next();

        } else if ($this.hasClass('galprevious')) {
            gal.controls.previous();

        } else if ($this.hasClass('galclose')) {
            gal.controls.end();
            gal.fullscreen.exit();

        } else if (hasFullscreen && $this.hasClass('galfullscreen-enter')) {

            gal.fullscreen.enter(function () {

                gal.updateGalSizes();

                $this.removeClass('galfullscreen-enter')
                    .addClass('galfullscreen-exit');
            });

        } else if (hasFullscreen && $this.hasClass('galfullscreen-exit')) {

            gal.updateGalSizes();

            gal.fullscreen.exit(function () {
                $this.removeClass('galfullscreen-exit')
                        .addClass('galfullscreen-enter');

            });
        }
    }

    // keydown events
    function handleKeydown(e) {
        var key = e.keyCode || e.which;
        switch (key) {
        case keys.left:
            gal.controls.previous();
            break;
        case keys.right:
            gal.controls.next();
            break;
        case keys.escape:
            gal.controls.end();
            break;
        default:
            break;
        }
    }

    // touch events
    function handleTouch(e) {
        var type = e.type;
        if (typeof gal.drag[type] === 'function') {
            gal.drag[type](e.originalEvent, e.currentTarget, gal.controls);
        }
    }

    // window resize
    function handleResize(e) {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(function () {
            if (!gal.$slides) {
                return;
            }
            gal.updateGalSizes();

            if (gal.curItem) {
                gal.controls.showSlide(gal.curItem);
            }

        }, 200);
    }

    gal.initGalEvents = function () {
        $('body').on('click', '.galcontrol', handleClicks)
                .on('keydown', handleKeydown);

        // remove touch events
        if (Modernizr.touch) {
            $body.on('touchstart touchmove touchend', '.galslides',
                    handleTouch);
        }

        // remove resize events
        $(window).on('resize', handleResize);
    };

    gal.removeGalEvents = function () {
        // remove clicks and keyboard events
        $body.off('click', '.galcontrol', handleClicks)
                .off('keydown', handleKeydown);


        // remove touch events
        if (Modernizr.touch) {
            $body.off('touchstart touchmove touchend', '.galslides',
                    handleTouch);
        }

        // remove resize events
        $(window).off('resize', handleResize);

    };

    gal.initLaunchEvent = function () {
        var collection = gal.collection,
            docEl = window.document.documentElement;

        // check fullscreen option
        if (docEl.requestFullscreen || docEl.mozRequestFullScreen ||
                docEl.webkitRequestFullScreen) {
            hasFullscreen = true;
            $('html').addClass('fullscreen');
        }

        // click events
        $body.on('click', '.gal a', function (e) {
            e.preventDefault();

            var id = $(this).data('id');

            gal.controls.start(collection.set(id));
            gal.initGalEvents();

        });

    };

    return gal;

}(gallery || {}));
