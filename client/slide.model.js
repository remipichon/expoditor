createSlide = function(options) {
    console.log("create slide", options.type);
    if (typeof options === "undefined") {
        var options = {};
    }
    if (typeof options.pos === "undefined") {
        options.pos = {
            x: 200,
            y: 200
        };
    }
    return Slides.insert({
        _id: Random.id(),
        informations: {
            title: options.title
        },
        slideshowReference: [Slideshow.findOne({})._id],
        elements: [],
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
updateSlidePos = function() {
    console.log("updateSlidePos", this._id);



    var $slide = $("#" + this._id);
    var top = parseFloat($slide.css('top'));
    var left = parseFloat($slide.css('left'));
    //var scaleX = parseFloat($slide.css("transform").split(',')[0].match(/[0-9]/g).join().replace(',','.'));
    //var scaleY = parseFloat($slide.css("transform").split(',')[3].match(/[0-9]/g).join().replace(',','.'));
    /*
    this.CSS = {
        top: top,
        left: left
    };
    this.size = {
        width: 900, //parseFloat(this.displayOptions.editor.size.width),
        height: 700 //parseFloat(this.displayOptions.editor.size.height)
    }

    delete this.center; // pour liberer la place
    recalcPos.apply(this, [{
        ratioLeft: 5,
        ratioTop: 5
    }]);

    var pos = {
        x: this.center.x,
        y: this.center.y,
        z: 0
    };
    //console.log("updateSlidePos",left,top,scaleX,scaleY,pos.x,pos.y)

*/

    //console.log("updateSlidePos debug pos", top, left);
    

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
        x: this.center.x,//left * ratioSlideshowMode,
        y: this.center.y,//top * ratioSlideshowMode,
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

    return Slides.update(slide._id, {
        $set: {
            "displayOptions.editor.positions": pos,
            "displayOptions.jmpress.positions": pos
        }
    });
};