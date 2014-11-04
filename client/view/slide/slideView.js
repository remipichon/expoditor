/********************** INJECT DATA **********************/

/**
 * gives slides to slideshow editor mode
 * @return {cursor} all slides related to the slideshow loaded, sorted by order
 */
Template.editorContainer.slides = function() {
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
    if (CurrentEditing.find({}).fetch().length > 1) {
        throw new Meteor.Error("500", "More than one slide in CurrentEditing");
    }
    return CurrentEditing.find({});
};



/********************** RENDER **********************/

/*
 * callback of render to add draggable when in slideshow edit mode
 */
Template.editorSlide.rendered = function() {
    this.data.id = this.data._id;

    //set dragger
    this.data.id = this.data.id;
    var dragged = goog.dom.getElement(this.data._id);    
    var dr = goog.dom.getElement(this.data._id+"drag-me");
    googDragger.init(dragged, dr, this.data, slideControler.instanceName);

    
    goog.events.listen(goog.dom.getElement(this.data.id), goog.events.EventType.DBLCLICK,
        _updateTitleCaller, 'false',this.data);

};

_updateTitleCaller = function(e){
    e.stopPropagation();
    slideControler.updateTitle(this);
}


/********************** HELPERS *********************/


Template.editorSlide.isLocked = function() {
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
 * calculate position and size of a slide in slideshow editor mode according to positionService.ratioSlideshowMode
 * @param  {string} axis which CSS style is needed
 * @return {int}      value of the CSS style
 */
Template.editorSlide.getEditorData = function(axis) {

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
        top: positionService.ratioSlideshowMode,
        left: positionService.ratioSlideshowMode
    }
    delete this.CSS;
    positionService.posToCSS(this);

    switch (axis) {
        case "x":
            var coord = this.CSS.left; //posX / positionService.ratioSlideshowMode;
            break;
        case "y":
            var coord = this.CSS.top; //tposY / positionService.ratioSlideshowMode;
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
            var coord = this.displayOptions.editor.size.height / positionService.ratioSlideshowMode; //
            break;
        case "w":
            var coord = this.displayOptions.editor.size.width / positionService.ratioSlideshowMode; //
            break;
        default:
            return "";

    }
    return coord;
};