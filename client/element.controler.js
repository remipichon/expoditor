Template.createElementTexte.events({
    'click': function(event) {
        event.stopPropagation();
        createElementTexte({
            slideId: this._id
        });
    }
});



Template.deleteElement.events({
    'click': function(event) {
        deleteSlideElement.call(this);
    }
});



updateSlideElementControler = function() {
    updateWithLocksControler.apply(this, updateSlideElementModel);
};






/*********************
    Le code ci dessous n'est plus utile depuis la migration de Spark vers Blaze.
    En revanche, je le garde parce qu'il est bien fait ;)

*********************/    


/**
 * maj des elements en cours d'édition à la main
 */
//tous les elements de la slide en cours d'édition
/**
 * When a slide is added to CurrentEditing, create an handler to watch for news elements created
 * and updated by others client. Element in slide content editor are {#constant} in order to prevent
 * losing dragger and editor aspect, this observeChanges manually update pos and content of elements 
 * updating by others clients (and skip element currently editing by the client TODO improve this) 
 */

/*
CurrentEditing.find({}).observeChanges({
    added: function(_id, fields) {
        console.log("slide added to current editing", _id, Elements.find({
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
                console.log("debug : an element has been added");
            },
            changed: function(_id, fields) {
                var gwrapper = goog.dom.getElement(_id + '-currentEditing-wrapper');

                if (goog.dom.classes.has(gwrapper, 'currentlyEditingByMe')) {
                    console.log("debug update skipped")
                    return;
                }
                console.log("elements changed", _id, fields);

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
        console.log("slide removed to current editing");
        handleElementCurrentEditing.stop();
    }
});
*/
