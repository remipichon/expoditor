/********************** INJECT DATA **********************/

/**
 * slideshow editor mode
 */
Template.elementsArea.elements = function() {
    //logger.debug("Template.elementsArea.elements";this._id);
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
    //logger.debug("Template.elementsAreaCurrentEditing.elements",this._id);
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
    //logger.log("Template.elementCurrentEditing.rendered", this.data._id);

    this.data.id = this.data._id + '-currentEditing';
    googEditor.init(this.data.id);

    //set resize and draggable on wrapper
    this.data.id = this.data.id + '-wrapper';

    var dragged = goog.dom.getElement(this.data._id + '-currentEditing-wrapper');
    var dr = goog.dom.getElement(this.data._id + '-dragMe');
    var dragger = new goog.fx.Dragger(dragged, dr);
    goog.events.listen(dragger, 'start', callerStartDrag, 'false', this.data);
    // if (Session.get("heavyRefresh")) 
    goog.events.listen(dragger, goog.fx.Dragger.EventType.DRAG, callerDrag, 'false', this.data);
    goog.events.listen(dragger, 'end', callerEndDrag, 'false', this.data);

    resizeService.init(this.data);
}

callerStartDrag = function(e){
    e.stopPropagation();
    elementControler.startDrag(this);
}
callerDrag = function() {
    elementControler.drag(this);
}
callerEndDrag = function() {
    elementControler.endDrag(this);
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


Template.element.getFontSize = function() {
    return 16 / ratioSlideshowMode; //16 est un peu au pif via le debugger
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



/*********************
    Le code ci dessous n'est plus utile depuis la migration de Spark vers Blaze.
    En revanche, je le garde parce qu'il montre bien l'usage des observeChange
*********************/


/**
 * maj des elements en cours d'édition à la main
 */
//tous les elements de la slide en cours d'édition
/**
 * When a slide is added to CurrentEditing, create an handler to watch for news elements created
 * and updated by others client. Element in slide content editor are {#constant} in order to prevent
 * losing dragger and editor aspect, this observeChanges manually update pos and content of elements
 * updating by others clients (and skip element currently editing by the client improve this)
 */

/*
CurrentEditing.find({}).observeChanges({
    added: function(_id, fields) {
        logger.log("slide added to current editing", _id, Elements.find({
            slideReference: {
                $in: [_id]
            }
        }).fetch());

        handleElementCurrentEditing = Elements.find({
            slideReference: {
                $in: [_id]
            }
        }).observeChanges({
            added: function(_id) {
                logger.log("debug : an element has been added");
            },
            changed: function(_id, fields) {
                var gwrapper = goog.dom.getElement(_id + '-currentEditing-wrapper');

                if (goog.dom.classes.has(gwrapper, 'currentlyEditingByMe')) {
                    logger.log("debug update skipped")
                    return;
                }
                logger.log("elements changed", _id, fields);

                //display options
                if (typeof fields.displayOptions !== 'undefined') {

                    //positions
                    var current = goog.style.getPosition(gwrapper);
                    var update = fields.displayOptions.editor.positions;

                    //a factotiser avec le getEditorData
                    this.center = {
                        x: parseFloat(fields.displayOptions.editor.positions.x),
                        y: parseFloat(fields.displayOptions.editor.positions.y)
                    };
                    this.size = {
                        width: parseFloat(fields.displayOptions.editor.size.width),
                        height: parseFloat(fields.displayOptions.editor.size.height)
                    }
                    this.ratio = {
                        top: ratioContentMode,
                        left: ratioContentMode
                    }
                    delete this.CSS;
                    posToCSS.call(this);


                    goog.style.setPosition(gwrapper, this.CSS.left, this.CSS.top);



                }

                //content
                if (typeof fields.content !== 'undefined') {
                    var $editor = $('#' + _id + '-currentEditing');
                    $editor.html(fields.content);
                }
            }

        });
    },
    changed: function(_id, fields) {
        //nothing to do
    },
    removed: function(_id, fields) {
        logger.log("slide removed to current editing");
        handleElementCurrentEditing.stop();
    }
});
*/