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
