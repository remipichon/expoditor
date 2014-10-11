/********************** INJECT DATA **********************/

Template.elementsAreaTimeline.elements = function() {
    //logger.debug("Template.elementsAreaTimeline.elements");
    return Elements.find({
        slideReference: {
            $in: [this._id]
        }
    });
};