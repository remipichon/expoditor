/**
 * MIGRATION DONE
 */


/**
 * [createSlide description]
 * @param  {object} options given options to set a slide :
 *                          * pos.x/y   (default)
 *                          * title     (default)
 *                          * order     (default)
 */
createSlide = function(options) {
    logger.info("createSlide", options);
    if (typeof options === "undefined") {
        var options = {};
    }

    if (typeof options.pos === "undefined") {
        options.pos = {
            x: 2000,
            y: 2000
        };
        // logger.log("create element texte with pos",options.pos.x, options.pox.y);
    }

    if (typeof options.order === "undefined") {
        options.order = $("#timeline .timeline-slide").length + 1;
    }
    if (typeof options.title === "undefined") {
        var d = new Date;
        options.title = "ele:" + d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();

    }

    return Slides.insert({
        _id: Random.id(),
        informations: {
            title: options.title
        },
        slideshowReference: [Slideshow.findOne({})._id],
        elements: [],
        order: options.order,
        displayOptions: {
            editor: {
                positions: {
                    x: options.pos.x,
                    y: options.pos.y,
                    z: 0
                },
                size: {
                    width: 900,
                    height: 700
                }
            },
            jmpress: {
                positions: {
                    x: options.pos.x,
                    y: options.pos.y,
                    z: 0
                },
                rotates: {
                    x: 0,
                    y: 0,
                    z: 0
                }
            }
        }
    });
};



deleteSlide = function() {
    logger.info("delete slide : ", this._id);
    Slides.remove(this._id);
};



updateSlideTitleModel = function() {
    logger.info("updateSlideTitleModel");
    var title = prompt("new title", this.informations.title);

    if (title != null) {
        Slides.update(this._id, {
            $set: {
                "informations.title": title
            }
        });
    }

    logger.info("update title : remove lock of slide", this._id);
    removeLocksControler.call(this);

};



/**
 * update a slide by this._id. Read CSS left/top in DOM and convert into real pos accordind to
 * slide size and ratioSlideshowMode
 *
 */
updateSlidePos = function(getUpdateData) {
    logger.info("updateSlidePos", this._id);



    var $slide = $("#" + this._id);
    var top = parseFloat($slide.css('top'));
    var left = parseFloat($slide.css('left'));


    this.CSS = {
        top: top,
        left: left
    };
    this.size = {
        width: parseFloat(this.displayOptions.editor.size.width),
        height: parseFloat(this.displayOptions.editor.size.height)
    }
    this.ratio = {
        top: ratioSlideshowMode,
        left: ratioSlideshowMode
    }
    delete this.center; // pour liberer la place
    CSSToPos.call(this);



    var pos = {
        x: this.center.x,
        y: this.center.y,
        z: 0
    };

    var slide = Slides.findOne({
        _id: this._id
    });

    //petite verif que la slide a effectivement bougée
    if (slide.displayOptions.editor.positions.x == pos.x && slide.displayOptions.editor.positions.y == pos.y) {
        logger.log("updateSlidePosMove : slide didn't really move");
        return;
    }

    var update = {
        $set: {
            "displayOptions.editor.positions": pos,
            "displayOptions.jmpress.positions": pos
        }
    };

    if (typeof getUpdateData !== 'undefined' && getUpdateData) {
        return update;
    }

    return Slides.update(slide._id, update);
};