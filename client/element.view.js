Template.elementsArea.elements = function() {
    return Elements.find({
        slideReference: {
            $in: [this._id]
        }
    });
};

Template.elementsAreaCurrentEditing.elements = function() {
    return Elements.find({
        slideReference: {
            $in: [this._id]
        }
    });
};

Template.elementsAreaTimeline.elements = function() {
    return Elements.find({
        slideReference: {
            $in: [this._id]
        }
    });
};


/******* render *****/



/**
 * le .create est appelé à chaque fois c'est juste un precallback du render
 * @return {[type]} [description]
 */
/**
 * add editor and dragger
 * @return {[type]} [description]
 */
Template.elementCurrentEditing.rendered = function() {
    //pour eviter d'ajouter un editor et un handler dragger à chaque rended
    //on ecrit dans le data du DOM qu'on a déjà init le bazar
    console.log("#" + this.data._id + '-currentEditing');
    if (typeof $("#" + this.data._id + '-currentEditing').data("editorDraggedIsSet") === 'undefined') {
        console.log("render element for currentEditing", this.data._id);
        setEditor(this.data._id + '-currentEditing');

        this.data.id = this.data._id + '-currentEditing';
        var dragger = new goog.fx.Dragger(goog.dom.getElement(this.data._id + '-currentEditing-wrapper'));
        goog.events.listen(dragger, 'start', startDragElement, 'false', this.data);
        if (Session.get("heavyRefresh")) goog.events.listen(dragger, goog.fx.Dragger.EventType.DRAG, dragElement, 'false', this.data);
        goog.events.listen(dragger, 'end', endDragElement, 'false', this.data);

        $("#" + this.data._id + '-currentEditing').data("editorDraggedIsSet", true);
    } else {
        console.log("render element for currentEditing SKIPPED", this.data._id);
    }
}


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