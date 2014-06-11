

startDragSlide = function(e) {
    e.stopPropagation();
    $("#" + this._id).toggleClass('dragged');
    console.log("slide start drag");
}
startDragElement = function(e) {
    e.stopPropagation();
    $("#" + this._id).toggleClass('dragged');
    $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    e.stopPropagation();
    console.log("elment start drag")
}
endDragSlide = function(e) {
    $("#" + this._id).toggleClass('dragged');
    updateSlidePos.call(this);
}

dragSlide = function(e) {
    updateSlidePos.call(this);
}
endDragElement = function(e) {
    $("#" + this._id).toggleClass('dragged');
    $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    console.log("endDragElement");
    updateElementPos.call(this);
}
dragElement = function(e) {
    updateElementPos.call(this);
}