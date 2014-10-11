/********************** INJECT DATA **********************/

/**
 * slideshow editor mode
 */
Template.elementsArea.elements = function() {
    //logger.debug("Template.elementsArea.elements");
    return Elements.find({
        slideReference: {
            $in: [this._id]
        }
    });
};

/**
 * content slide editor mode
 */
Template.elementsAreaCurrentEditing.elements = function() {
    //logger.debug("Template.elementsAreaCurrentEditing.elements");
    return Elements.find({
        slideReference: {
            $in: [this._id]
        }
    });
};

/**
 * update text content dynamically
 */
Meteor.startup(function() {
    Elements.find({}).observeChanges({
        changed: function(elemenId, fields) {
            //logger.debug("Elements.obsverveChanges.changed",elemenId);
            if (typeof fields.content !== "undefined") {
                //logger.debug("Elements.obsverveChanges.changed.content",fields.content);
                var editor = $("#" + elemenId + "-currentEditing").data("editorInstance");
                editor.setHtml(false, fields.content, true, true)
            }
        },
    });
});



/********************** RENDER **********************/


/**
 * add editor and dragger and resize on an element in slide content editor mode
 */
Template.elementCurrentEditing.rendered = function() {
    logger.log("Template.elementCurrentEditing.rendered", this.data._id);

    this.data.id = this.data._id + '-currentEditing';
    setEditor(this.data.id);

    //set resize and draggable on wrapper
    this.data.id = this.data.id + '-wrapper';

    var dragged = goog.dom.getElement(this.data._id + '-currentEditing-wrapper');
    var dr = goog.dom.getElement(this.data._id + '-dragMe');
    var dragger = new goog.fx.Dragger(dragged, dr);
    goog.events.listen(dragger, 'start', startDragElement, 'false', this.data);
    if (Session.get("heavyRefresh")) goog.events.listen(dragger, goog.fx.Dragger.EventType.DRAG, dragElement, 'false', this.data);
    goog.events.listen(dragger, 'end', endDragElement, 'false', this.data);

    setResize.call(this.data);
}



/********************** HELPERS *********************/

/**
 * calculate position and size of an element in slideshow editor mode according to ratioSlideshowMode
 * @param  {string} axis which CSS style is needed
 * @return {int}      value of the CSS style
 */
Template.element.getEditorData = function(axis) {
    // if (typeof this.CSS === 'undefined') {
    logger.log("Template.element.getEditorData", this._id);

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
    //}

    switch (axis) {
        case "x":
            var coord = this.CSS.left;
            break;
        case "y":
            var coord = this.CSS.top;
            break;
        case "z":
            var coord = 0;
            break;
        case "scaleX":
            var coord = 1;
            break;
        case "scaleY":
            var coord = 1;
            break;
        case "h":
            var coord = this.displayOptions.editor.size.height / ratioSlideshowMode;
            break;
        case "w":
            var coord = this.displayOptions.editor.size.width / ratioSlideshowMode;;
            break;
        default:
            return "";

    }

    return coord;
};

/**
 * calculate position and size of an element in slide content editor mode according to ratioSlideshowMode
 * @param  {string} axis which CSS style is needed
 * @return {int}      value of the CSS style
 */
Template.elementCurrentEditing.getEditorData = function(axis) { //pas encore utilisé à cause du draggable de jqueryreu

    if (typeof this.CSS === 'undefined') { //works here because elementCurrendEditing are #constant
        //logger.debug("Template.elementCurrentEditing.getEditorData", this._id);

        //a a factoriser avec l'observeChanges
        this.center = {
            x: parseFloat(this.displayOptions.editor.positions.x),
            y: parseFloat(this.displayOptions.editor.positions.y)
        };
        this.size = {
            width: parseFloat(this.displayOptions.editor.size.width),
            height: parseFloat(this.displayOptions.editor.size.height)
        }
        this.ratio = {
            top: ratioContentMode,
            left: ratioContentMode
        }
        delete this.CSS;
        posToCSS.call(this);
    }


    switch (axis) {
        case "x":
            var coord = this.CSS.left;
            break;
        case "y":
            var coord = this.CSS.top;
            break;
        case "z":
            var coord = 0;
            break;
        case "scaleX":
            var coord = 1;
            break;
        case "scaleY":
            var coord = 1;
            break;
        case "h":
            var coord = this.displayOptions.editor.size.height / ratioContentMode;
            break;
        case "w":
            var coord = this.displayOptions.editor.size.width / ratioContentMode;;
            break;
        default:
            return "";
    }


    return coord;
};


/**
 * calculate position and size of an element in the timeline according to ratioTimeline
 * @param  {string} axis which CSS style is needed
 * @return {int}      value of the CSS style
 */
Template.elementTimeline.getEditorData = function(axis) {
    // if (typeof this.CSS === 'undefined') {
    //logger.debug("Template.elementTimeline.getEditorData", this._id);

    this.center = {
        x: parseFloat(this.displayOptions.editor.positions.x),
        y: parseFloat(this.displayOptions.editor.positions.y)
    };
    this.size = {
        width: parseFloat(this.displayOptions.editor.size.width),
        height: parseFloat(this.displayOptions.editor.size.height)
    }
    this.ratio = {
        top: ratioTimeline,
        left: ratioTimeline
    }
    delete this.CSS;
    posToCSS.call(this);
    //}

    switch (axis) {
        case "x":
            var coord = this.CSS.left;
            break;
        case "y":
            var coord = this.CSS.top;
            break;
        case "z":
            var coord = 0;
            break;
        case "scaleX":
            var coord = 1;
            break;
        case "scaleY":
            var coord = 1;
            break;
        case "h":
            var coord = this.displayOptions.editor.size.height / ratioTimeline;
            break;
        case "w":
            var coord = this.displayOptions.editor.size.width / ratioTimeline;;
            break;
        default:
            return "";

    }

    return coord;
};


Template.element.getFontSize = function() {
    return 16 / ratioSlideshowMode; //16 est un peu au pif via le debugger
}

Template.elementTimeline.getFontSize = function() {
    return 16 / ratioTimeline;
}

Template.elementCurrentEditing.isLocked = function() {
    //logger.debug("Template.elementCurrentEditing.isLocked");
    var component = Locks.findOne({
        componentId: this._id,
        user: {
            $not: null
        }
    });

    if (typeof component !== "undefined") {
        //logger.debug("Template.elementCurrentEditing.isLocked", "element is locked");
        return "locked";
    }

    return "";
}