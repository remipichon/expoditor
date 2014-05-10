/**
 * [createSlide description]
 * @param  {object} options given options to set a slide :
 *                          * pos.x/y   (default)
 *                          * title     (default)
 *                          * order     (default)
 */
createSlide = function(options) {
    console.log("create slide", options.type);
    if (typeof options === "undefined") {
        var options = {};
    }
    if (typeof options === 'undefined') {
        if (typeof options.pos === "undefined") {
            options.pos = {
                x: 2000,
                y: 2000
            };
            // console.log("create element texte with pos",options.pos.x, options.pox.y);
        }
    } else {
        if (typeof options.order === "undefined") {
            options.order = $("#timeline .timeline-slide").length + 1;
        }
        if (typeof options.title === "undefined") {
            var d = new Date;
            options.title = "ele:" + d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();

        }
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
    console.log("delete slide : ", this._id);
    Slides.remove(this._id);
};


/*
 * TODO : passer ca en mode this !!!
 */
updateSlideTitleModel = function(slide) {
    console.log("update title, model");
    var title = prompt("new title", slide.informations.title);

    if (title != null) {
        Slides.update(slide._id, {
            $set: {
                "informations.title": title
            }
        });
    }

    console.log("update title : remove lock of slide", slide._id);
    removeLocksControler.call(slide);

};



/*
 * TODO : remettre au gout du jour le getCloserSlide
 */
/**
 * update a slide by this._id. Read CSS left/top in DOM and convert into real pos accordind to
 * slide size and ratioSlideshowMode
 *
 */
updateSlidePos = function(getUpdateData) {
    console.log("updateSlidePos", this._id);



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
    if (slide.displayOptions.editor.positions.x == left && slide.displayOptions.editor.positions.y == top) {
        console.log("updateSlidePosMove : slide didn't really move");
        return;
    }

    //petite verif qu'on se superpose pas avec une slide
    //    var closer = getCloserSlide(slide._id, {x: left + "px", y: top});
    //    console.log(closer.length);
    //    console.log(slide._id,  newTop, newLeft, closer);
    //    console.log(getCloserSlide(slide._id, {x: newTop, y: newLeft}));
    //    if (closer.length != 0) {
    //        console.log("updateSlidePosMove : trop proche d'une slide")
    //        return;
    //    }

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