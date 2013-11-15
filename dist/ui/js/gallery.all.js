/*global $*/
var gallery = (function (gal) {

    "use strict";

    gal.createCollection = function () {
        var $elems = gal.$root.find('a'),
            len = $elems && $elems.length,
            current,
            curId,
            collection = [],
            api = {};

        // loops all anchor elements in root
        // reads attribute
        // and builds collection to work with
        $elems.each(function (i) {
            var $this = $(this);
            $this.data('id', i);
            collection.push({
                $img            : this.href,
                $title          : this.title,
                $description    : $this.data('description'),
                $index          : i + 1,
                $thumb          : $this.find('img')[0].src
            });
        });

        // store length of collection
        len = $elems.length;

        api.count = len;

        // return complete collection array
        api.all = function () {
            return collection;
        };

        /* gets collection item object
        * @param {string} id of item to return
        * @return {object} item
        */
        api.get = function (id) {
            return (collection[id]);
        };

        /* sets new current item 
        * @param {string} id to set new item to
        * @return {object} current item
        */
        api.set = function (id) {
            current = id < 0 ?
                        0 : id > (len - 1) ?
                        len - 1 : id;
            return this.get(current);
        };

        /* find next item in collecton
        * @return {object} next item object
        */
        api.next = function () {
            return this.get(current + 1);
        };

        /* sets next item to current 
        * @return {object} new current item object
        */
        api.setnext = function () {
            return this.set(current + 1);
        };

        /* gets previous item  
        * @return {object} previous item object
        */
        api.previous = function () {
            return this.get(current - 1);
        };

        /* sets previous item to current 
        * @return {object} new current item object
        */
        api.setprevious = function () {
            return this.set(current - 1);
        };

        // return public methods
        return api;
    };

    return gal;

}(gallery || {}));

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
                        gal.$slides[0].style.msTransform =
                        gal.$slides[0].style.transform =
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




var gallery = (function (gal) {

    "use strict";

    gal.drag = {

        touchstart : function (e, elem) {
            e.preventDefault();
            this.startx = e.touches[0].pageX;
            this.starty = e.touches[0].pageY;
            this.width = window.outerWidth - 20; 
            this.totalWidth = this.width * gal.collection.count;
            this.minMove = this.width / 5;

            this.startpos = gal.curpos;

            // for testing scroll/slide
            this.sliding = false;
            this.newx = null;

        },

        touchmove : function (e, elem) {
            var diffx;

            // is it swipe not multitouch like pinch
            if (e.touches.length > 1 || e.scale && e.scale !== 1) {
                this.sliding = false;
                return;
            }

            this.curx = e.touches[0].pageX;

            diffx = this.curx - (this.newx || this.startx);

            // determine it's a real slide
            if (this.sliding === false) {
                this.sliding = (Math.abs(diffx) > (this.starty - Math.abs(e.touches[0].pageY)));
            }

            if (this.sliding) {
                // prevent default behaviour if it's a gallery slide
                e.preventDefault();

                gal.$slides.addClass('galsliding');

                gal.controls.moveTo(gal.curpos + diffx);

                this.newx = this.curx;
            }
        },

        touchend : function (e, elem, controls) {

            this.sliding = false;
            this.newx = null;

            gal.$slides.removeClass('galsliding');

            var dist = this.startx - this.curx;

            if (Math.abs(dist) > this.minMove) {
                if (dist < 0) {
                    controls.previous();

                } else if (dist > 0) {
                    controls.next();

                }
            } else {
                gal.controls.moveTo(this.startpos);

            }

        }
    };

    return gal;

}(gallery || {}));
