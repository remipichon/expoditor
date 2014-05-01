/**
 * The following give elements of the slide (onto the slide) to each elements area needed
 */

/**
 * slideshow editor mode
 */
Template.elementsArea.elements = function() {
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
    return Elements.find({
        slideReference: {
            $in: [this._id]
        }
    });
};

/**
 * timeline
 */
Template.elementsAreaTimeline.elements = function() {
    return Elements.find({
        slideReference: {
            $in: [this._id]
        }
    });
};


/******* render *****/




/**
 * add editor and dragger and resize on an element in slide content editor mode
 */
Template.elementCurrentEditing.rendered = function() {
    console.log("render element for currentEditing", this.data._id);
    setEditor(this.data._id + '-currentEditing');

    this.data.id = this.data._id + '-currentEditing';
    var dragger = new goog.fx.Dragger(goog.dom.getElement(this.data._id + '-currentEditing-wrapper'));
    goog.events.listen(dragger, 'start', startDragElement, 'false', this.data);
    if (Session.get("heavyRefresh")) goog.events.listen(dragger, goog.fx.Dragger.EventType.DRAG, dragElement, 'false', this.data);
    goog.events.listen(dragger, 'end', endDragElement, 'false', this.data);

    setResize(this.data._id);
}

/**
 * calculate position and size of an element in slideshow editor mode according to ratioSlideshowMode
 * @param  {string} axis which CSS style is needed
 * @return {int}      value of the CSS style 
 */
Template.element.getEditorData = function(axis) {
   // if (typeof this.CSS === 'undefined') {
    console.log("element.getEditorData", this._id);

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
        console.log("elementCurrentEditing.getEditorData", this._id);

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
    console.log("elementTimeline.getEditorData", this._id);

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