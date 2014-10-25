/********************** INJECT DATA **********************/

/**
 * gives slides to slideshow editor mode
 * @return {cursor} all slides related to the slideshow loaded, sorted by order
 */
Template.editorContainer.slides = function() {
    //logger.debug("Template.editorContainer.slides","inject editor data");
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'editor') {
        return [];
    }
    return Slides.find({}, {
        sort: {
            order: 1
        }
    }); //enfait pas besoin du sort ici
};


/**
 * if a slide is added to collection CurrentEditing, it active the modal related
 * @return {[cursor]} one slide max, if not empty
 */
Template.modalCurrentEditing.editorCurrentEditing = function() {
    //logger.debug("Template.modalCurrentEditing.editorSlideCurrentEditing");
    if (CurrentEditing.find({}).fetch().length > 1) {
        throw new Meteor.Error("500","More than one slide in CurrentEditing");
       }
    return CurrentEditing.find({});
};



/********************** RENDER **********************/

/*
 * callback of render to add draggable when in slideshow edit mode
 */
Template.editorSlide.rendered = function() {
    logger.info("Template.editorSlide.rendered", this.data._id);

    this.data.id = this.data._id;

    var dragger = new goog.fx.Dragger(goog.dom.getElement(this.data._id));
    goog.events.listen(dragger, 'start', startDragSlide, 'false', this.data);
    goog.events.listen(dragger, goog.fx.Dragger.EventType.DRAG, dragSlide, 'false', this.data);    
    goog.events.listen(dragger, 'end', endDragSlide, 'false', this.data);

    //prevent doublclick    
    goog.events.listen(goog.dom.getElement(this.data.id), goog.events.EventType.DBLCLICK, doubleClickSlide, 'false');
    

};


/********************** HELPERS *********************/


Template.editorSlide.isLocked = function() {
    logger.info("Template.editorSlide.isLocked");
    var component = Locks.findOne({
        componentId: this._id,
        user: {
            $not: null
        }
    });

    if (typeof component !== "undefined") {
        return "locked";
    }

    return "";
};


/**
 * calculate position and size of a slide in slideshow editor mode according to ratioSlideshowMode
 * @param  {string} axis which CSS style is needed
 * @return {int}      value of the CSS style
 */
Template.editorSlide.getEditorData = function(axis) {

    // if(typeof this.CSS === "undefined"){
    //logger.debug('Template.editorSlide.getEditorData', this._id);
    var posX = parseFloat(this.displayOptions.editor.positions.x);
    var posY = parseFloat(this.displayOptions.editor.positions.y);

    this.center = {
        x: parseFloat(this.displayOptions.editor.positions.x),
        y: parseFloat(this.displayOptions.editor.positions.y)
    };
    this.size = {
        width: parseFloat(this.displayOptions.editor.size.width),
        height: parseFloat(this.displayOptions.editor.size.height)
    }
    this.ratio = {
        top: ratioSlideshowMode,
        left: ratioSlideshowMode
    }
    delete this.CSS;
    posToCSS.call(this);
    // }

    switch (axis) {
        case "x":
            var coord = this.CSS.left; //posX / ratioSlideshowMode;
            break;
        case "y":
            var coord = this.CSS.top; //tposY / ratioSlideshowMode;
            break;
        case "z":
            var coord = 0;
            break;
        case "scaleX":
            var coord = 1; /// 5;
            break;
        case "scaleY":
            var coord = 1; /// 5;
            break;
        case "h":
            var coord = this.displayOptions.editor.size.height / ratioSlideshowMode; //
            break;
        case "w":
            var coord = this.displayOptions.editor.size.width / ratioSlideshowMode; //
            break;
        default:
            return "";

    }
    return coord;
};

