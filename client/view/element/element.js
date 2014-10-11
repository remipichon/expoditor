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



/*
Elements.find({}).observeChanges({
    changed: function(elemenId, fields) {
        //logger.debug("Elements.obsverveChanges.changed",elemenId);
       if(typeof fields.content !== "undefined"){
             //logger.debug("Elements.obsverveChanges.changed.content",fields.content);
            var editor = $("#"+elemenId+"-currentEditing").data("editorInstance");
            editor.setHtml(false,fields.content,true,true)
        }
    },
});
*/