/*globals document, window, $, Modernizr*/
var gallery = (function (gal) {

    "use strict";

    gal.prepareGallery = function (galTmplId, imgTmplId) {
        // private variables
        // store template
        var containerTempl  = galTmplId ?
                                    document.getElementById(galTmplId).innerHTML :
                                    '',
            imgTempl        = imgTmplId ?
                                    document.getElementById(imgTmplId).innerHTML :
                                    '',
            $body = $('body'),
            CURRENT_CLASS = 'galslideCur',
            $gal,
            $style,
            $slidesCont,
            $cur,
            $img,
            captionTimer,
            collection = gal.collection,
            items = gal.collection.all(),
            len = gal.collection.count,
            hasTransform3d = Modernizr.csstransforms3d,
            api = {}; // public methods

        // there can be newlines from the cms, replace them for proper html <br>
        function handleNewLines(str) {
            var r = /\n/gm;
            return (typeof str === 'string' ? str.replace(r, '<br>') : str);
        }

        /* create html from template
        * @param {string} templ with placeholders
        * @param {object} itemData of collection
        */
        function parseHtml(templ, itemData) {
            var r = /\$\w+/gim;
            return templ.replace(r, function (m) {
                if (m === '$description') {
                    return handleNewLines(itemData[m]);
                }
                return itemData[m] || '';
            });
        }

        function createSlide(item) {
            if (item) {
                item.$indexof = item.$index + '/' + len;
                //item.$width = slidesWidth + 'px';
                $(parseHtml(imgTempl, item)).appendTo(gal.$slides);
            }
        }

        /* create gallery html
        * appends newly created DOM tree into the body element
        */
        function createGallery() {
            var i;

            // seems nasty to get right window width...
            // subtracts 20, which is the distance in css 
            // TODO - should be independent of css
            gal.slidesWidth = (window.innerWidth ||
                        document.documentElement.clientWidth) - 20;

            // create document fragment
            $gal = $(parseHtml(containerTempl));

            // expose in gal object
            gal.$slides = $gal.find('.galslider');
            $slidesCont = $gal.find('.galslides');

            // insert all items
            for (i = 0; i < len; i++) {
                createSlide(items[i]);
            }

            // and append into DOM
            $gal.appendTo($body);

        }

        // handle limits of collection
        function checkLimits(item) {
            // check previous
            if (item.$index <= 1) {
                $gal.addClass('galnoprevious');
            } else {
                $gal.removeClass('galnoprevious');
            }

            // check next
            if (item.$index >= len) {
                $gal.addClass('galnonext');
            } else {
                $gal.removeClass('galnonext');
            }

        }

        function fadeFooter() {

            if (captionTimer) {
                clearTimeout(captionTimer);
            }

            $gal.addClass('galhidecaption');

            captionTimer = setTimeout(function () {
                $gal.removeClass('galhidecaption');
            }, 500);
        }

        // load image helper
        function loadImage($cont) {
            var $tmp,
                $img;

            if ($cont.hasClass('galpending')) {

                $tmp = $('<img />');
                $img = $cont.find('img').first();

                // show loader
                $cont.addClass('galloading');

                // load img on temporary img, for preloading
                $tmp.load(function () {

                    $img.attr('src', $img.data('img'));

                    // give it some time to show more smoothly
                    $cont.removeClass('galloading galpending');

                    // flush load img helper
                    $tmp = null;

                }).attr('src', $img.data('img'));
            }
        }

        function loadImages(item) {
            var curIndex = item.$index,
                offset = [-1, 1, 0], // load images around current image
                x = offset.length,
                $cont,
                $img;

            while (x--) {
                $cont = $('#galimg_' + (curIndex - offset[x]));
                loadImage($cont);
            }

        }

        function offActive() {
            $('.' + CURRENT_CLASS).removeClass(CURRENT_CLASS);
        }

        function setActive(index) {
            // remove old active
            offActive();

            $('#galimg_' + index).addClass(CURRENT_CLASS);
        }

        api.moveTo = (function (posX) {
            // tranform
            if (hasTransform3d) {

                return function (posX) {
                    gal.$slides[0].style.MozTransform =
                        gal.$slides[0].style.webkitTransform =
                        'translate3d(' + posX + 'px, 0, 0)';
                    gal.curpos = posX;
                };
            }

            // for non transform3d browsers, do it with margins
            return function (posX) {
                gal.$slides.css({
                    "margin-left" : posX + 'px'
                });
                gal.curpos = posX;
            };

        }());

        api.showSlide = function (item) {
            // manage min max
            checkLimits(item);

            var left = (-(item.$index - 1) * gal.slidesWidth);

            fadeFooter();

            api.moveTo(left);

            loadImages(item);

            // set className
            setActive(item.$index);

            // assign reference to current item
            gal.curItem = item;
        };

        gal.updateGalSizes = function () {
            var slidesHeight = $slidesCont.innerHeight();
            gal.slidesWidth = (window.innerWidth ||
                    document.documentElement.clientWidth) - 20;

            if ($style) {
                $style.remove();
            }
            $style = $('<style type="text/css">.galslider .galslide {width: ' +
                gal.slidesWidth + 'px;height: ' + slidesHeight + 'px}</style>').appendTo($('head'));

        };

        api.start = function (item) {
            if ($.isPlainObject(item)) {
                var $curimg;

                // insert if not already created
                if (!$gal) {
                    createGallery();
                } else {
                    $gal.addClass('galhidden');
                }

                // not needed? TODO
                gal.updateGalSizes();

                // show item
                api.showSlide(item);

                // about time to show the thing
                $gal.removeClass('galhidden');

                // add class to body
                $body.addClass('galactive');

            }
        };

        api.end = function () {

            //fullscreen.exit();

            if ($gal) {
                $gal.remove();
                $gal = null;
            }

            // delete reference
            if (gal.$slides) {
                delete gal.$slides;
            }

            $body.removeClass('galactive');

            // cancel events
            gal.removeGalEvents();
        };

        api.previous = function () {
            var item = collection.setprevious();
            api.showSlide(item);
        };

        api.next = function () {
            var item = collection.setnext();
            api.showSlide(item);
        };

        // public methods
        return api;

    };

    return gal;

}(gallery || {}));
