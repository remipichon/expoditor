startDragSlide = function(e) {
    logger.info("startDragSlide");
    e.stopPropagation();
    $("#" + this._id).toggleClass('dragged');
}
startDragElement = function(e) {
    logger.info("startDragElement");
    e.stopPropagation();
    $("#" + this._id).toggleClass('dragged');
    $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    e.stopPropagation();
}
endDragSlide = function(e) {
    logger.info("endDragSlide");
    $("#" + this._id).toggleClass('dragged');
    updateSlidePos.call(this);
}

dragSlide = function(e) {
    logger.info("dragSlide");
    updateSlidePos.call(this);
}
endDragElement = function(e) {
    logger.info("endDragElement");
    $("#" + this._id).toggleClass('dragged');
    $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    updateElementPos.call(this);
}
dragElement = function(e) {
    logger.info("dragElement");
    updateElementPos.call(this);
}