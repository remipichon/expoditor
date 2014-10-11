GoogDragger = function(){};

GoogDragger.prototype.startDragSlide = function(e) {
    logger.info("GoogDragger.prototype.startDragSlide");
    e.stopPropagation();
    $("#" + this._id).toggleClass('dragged');
}
GoogDragger.prototype.startDragElement = function(e) {
    logger.info("GoogDragger.prototype.startDragElement");
    e.stopPropagation();
    $("#" + this._id).toggleClass('dragged');
    $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    e.stopPropagation();
}
GoogDragger.prototype.endDragSlide = function(e) {
    logger.info("GoogDragger.prototype.endDragSlide");
    $("#" + this._id).toggleClass('dragged');
    updateSlidePos.call(this);
}

GoogDragger.prototype.dragSlide = function(e) {
    logger.info("GoogDragger.prototype.dragSlide");
    updateSlidePos.call(this);
}
GoogDragger.prototype.endDragElement = function(e) {
    logger.info("GoogDragger.prototype.endDragElement");
    $("#" + this._id).toggleClass('dragged');
    $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    updateElementPos.call(this);
}
GoogDragger.prototype.dragElement = function(e) {
    logger.info("GoogDragger.prototype.dragElement");
    updateElementPos.call(this);
}