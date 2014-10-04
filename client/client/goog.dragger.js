

startDragSlide = function(e) {
    console.info("startDragSlide");
    e.stopPropagation();
    $("#" + this._id).toggleClass('dragged');
}
startDragElement = function(e) {
    console.info("startDragElement");
    e.stopPropagation();
    $("#" + this._id).toggleClass('dragged');
    $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    e.stopPropagation();
}
endDragSlide = function(e) {
    console.info("endDragSlide");
    $("#" + this._id).toggleClass('dragged');
    updateSlidePos.call(this);
}

dragSlide = function(e) {
    console.info("dragSlide");
    updateSlidePos.call(this);
}
endDragElement = function(e) {
    console.info("endDragElement");
    $("#" + this._id).toggleClass('dragged');
    $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    updateElementPos.call(this);
}
dragElement = function(e) {
    console.info("dragElement");
    updateElementPos.call(this);
}