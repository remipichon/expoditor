SlideDAO = function(args) {
     //constructor
    this.defaultPos = {
        x: 2000,
        y: 2000
    };

    this.defaultContent = "Type text here";

    if (typeof args === "string") {
        this._id = args;
    } else if (typeof args === "object") {
        //TODO merge this et args
    } else {
        this._id = null;
    }
};


/**
 * [createSlide description]
 * @param  {object} options given options to set a slide :
 *                          * pos.x/y   (default)
 *                          * title     (default)
 *                          * order     (default)
 */
SlideDAO.prototype.create = function() {

    if (typeof this.pos === "undefined") {
        this.pos = {
            x: 2000,
            y: 2000
        };
    }

    if (typeof this.order === "undefined") {
        this.order = $("#timeline .timeline-slide").length + 1;
    }
    if (typeof this.title === "undefined") {
        var d = new Date;
        this.title = "ele:" + d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();

    }

    var sl = Slides.insert({
        _id: Random.id(),
        informations: {
            title: this.title
        },
        slideshowReference: [Slideshow.findOne({})._id],
        elements: [],
        order: this.order,
        displayOptions: {
            editor: {
                positions: {
                    x: this.pos.x,
                    y: this.pos.y,
                    z: 0
                },
                size: {
                    width: 900,
                    height: 700
                }
            },
            jmpress: {
                positions: {
                    x: this.pos.x,
                    y: this.pos.y,
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

    this._id = sl;
    return this._id;
};


SlideDAO.prototype.delete = function() {
    if (!userHasAccessToComponent.call(this)) {
        throw new Meteor.Error('500', 'deleteSlideElement : cannot remove an element locked');
    }
    return Slides.remove(this._id);
};


//updateSlideTitleModel
SlideDAO.prototype.updateTitle = function() {
    return Slides.update(this._id, {
        $set: {

            "informations.title": this.informations.title
        }
    });
};



/**
 * update a slide by this._id. Read CSS left/top in DOM and convert into real pos accordind to
 * slide size and positionService.ratioSlideshowMode
 * @param  {boolean} getUpdateData wether or not return the update objet or really update data
 */
SlideDAO.prototype.updatePos = function(getUpdateData) {
    
    this.ratio = {
        top: positionService.ratioSlideshowMode,
        left: positionService.ratioSlideshowMode
    }
    delete this.center; // pour liberer la place
    positionService.CSSToPos(this);

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
        logger.info("updateSlidePosMove : slide didn't really move");
        return -1;
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


SlideDAO.prototype.updateOrder = function() {
    return Slides.update({
        _id: this._id
    }, {
        $set: {
            order: parseInt(this.order)
        }
    });

}