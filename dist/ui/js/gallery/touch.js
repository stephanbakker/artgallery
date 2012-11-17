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
