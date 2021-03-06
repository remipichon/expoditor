/* INJECT DATA */

/* * slideshow editor mode */
Template.elementsArea.helpers({
    elements : function() {
        // logger.debug("Template.elementsArea.elements"; this._id);
        // logger.debug("Template.elementsArea.elements"; this._id);
        return Elements.find({
            slideReference: {    $in: [this._id]
            }
        });
    }
});

/**
 * content slide editor mode
 */
 Template.elementsAreaCurrentEditing.helpers({
    elements : function() {
        //logger.debug("Template.elementsAreaCurrentEditing.elements",this._id);
        return Elements.find({
            slideReference: {
                $in: [this._id]
            }
        });
    }
});

/**
 * update text content dynamically
 */
// Meteor.startup(function() {
//     Elements.find({}).observeChanges({
//         changed: function(elemenId, fields) {
//             //logger.debug("Elements.obsverveChanges.changed",elemenId);
//             if (typeof fields.content !== "undefined") {
//                 //logger.debug("Elements.obsverveChanges.changed.content",fields.content);
//                 var editor = $("#" + elemenId + "-currentEditing").data("editorInstance");
//                 editor.setHtml(false, fields.content, true, true)
//             }
//         },
//     });
// });



/********************** RENDER **********************/


/**
 * add editor and dragger and resize on an element in slide content editor mode
 */
 Template.elementCurrentEditing.rendered = function() {
    var baseId = this.data._id + '-currentEditing';
    
    //set text editor
    this.data.id = baseId;
    var field = goog.dom.getElement(this.data.id); //_id + '-currentEditing-wrapper');
    googEditor.init(field, this.data, elementControler.instanceName);
    
    this.data.id = baseId+ '-wrapper';
    //set draggable on wrapper
    var dragged = goog.dom.getElement(this.data.id); //_id + '-currentEditing-wrapper');
    var dr = goog.dom.getElement(this.data._id + '-dragMe');// + '-dragMe');
    googDragger.init(dragged, dr, this.data, elementControler.instanceName);

    //set resize on wrapper    
    var widgetbox = goog.dom.getElement(this.data.id);
    resizeService.init(widgetbox, this.data, elementControler.instanceName);
}



/********************** HELPERS *********************/
//TODO factoriser les getEditor data non ?
/**
 * calculate position and size of an element in slideshow editor mode according to positionService.ratioSlideshowMode
 * @param  {string} axis which CSS style is needed
 * @return {int}      value of the CSS style
 */
 Template.element.helpers({
    getEditorData : function(axis) {
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
            var coord = this.displayOptions.editor.size.height / positionService.ratioSlideshowMode;
            break;
            case "w":
            var coord = this.displayOptions.editor.size.width / positionService.ratioSlideshowMode;;
            break;
            default:
            return "";

        }

        return coord;
    },
    getFontSize : function() {
        return 16 / positionService.ratioSlideshowMode; //16 est un peu au pif via le debugger
    }
});

/**
 * calculate position and size of an element in slide content editor mode according to positionService.ratioSlideshowMode
 * @param  {string} axis which CSS style is needed
 * @return {int}      value of the CSS style
 */
 Template.elementCurrentEditing.helpers({
    getEditorData : function(axis) { //pas encore utilisÃ© Ã  cause du draggable de jqueryreu
        if (typeof this.CSS === 'undefined') { //works here because elementCurrendEditing are #constant

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
                top: positionService.ratioContentMode,
                left: positionService.ratioContentMode
            }
            delete this.CSS;
            positionService.posToCSS(this);
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
            var coord = this.displayOptions.editor.size.height / positionService.ratioContentMode;
            break;
            case "w":
            var coord = this.displayOptions.editor.size.width / positionService.ratioContentMode;;
            break;
            default:
            return "";
        }
        return coord;
    },
    //lock by content
    isLocked : function() {
        var component = Locks.findOne({
            componentId: this._id,
            "fields.content": {
                $not: null
            }
        });
        if (typeof component !== "undefined") {
            return "locked";
        }
        return "";
    }
});

 Template.elementTimeline.helpers({
    getEditorData : function(axis) { //pas encore utilisÃ© Ã  cause du draggable de jqueryreu
        if (typeof this.CSS === 'undefined') { //works here because elementCurrendEditing are #constant

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
                top: positionService.ratioTimeline,
                left: positionService.ratioTimeline
            }
            delete this.CSS;
            positionService.posToCSS(this);
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
            var coord = this.displayOptions.editor.size.height / positionService.ratioTimeline;
            break;
            case "w":
            var coord = this.displayOptions.editor.size.width / positionService.ratioTimeline;
            break;
            default:
            return "";
        }
        return coord;
    }

});



/*********************
    Le code ci dessous n'est plus utile depuis la migration de Spark vers Blaze.
    En revanche, je le garde parce qu'il montre bien l'usage des observeChange
    *********************/


/**
 * maj des elements en cours d'Ã©dition Ã  la main
 */
//tous les elements de la slide en cours d'Ã©dition
/**
 * When a slide is added to CurrentEditing, create an handler to watch for news elements created
 * and updated by others client. Element in slide content editor are {#constant} in order to prevent
 * losing dragger and editor aspect, this observeChanges manually update pos and content of elements
 * updating by others clients (and skip element currently editing by the client improve this)
 */

/*
CurrentEditing.find({}).observeChanges({
    added: function(_id, fields) {
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
            },
            changed: function(_id, fields) {
                var gwrapper = goog.dom.getElement(_id + '-currentEditing-wrapper');

                if (goog.dom.classes.has(gwrapper, 'currentlyEditingByMe')) {
                    return;
                }

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
                        top: positionService.ratioContentMode,
                        left: positionService.ratioContentMode
                    }
                    delete this.CSS;
                    positionService.posToCSS(this);


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
        handleElementCurrentEditing.stop();
    }
});
*/