ResizeService = function() {};


ResizeService.prototype.init = function(widgetbox,component, callbackTarget,callback) {
  if (typeof window[callbackTarget] !== "object") {
    logger.error(callbackTarget, "doesn't exist in the window scope");
    return;
  }
  component.callbackTarget = callbackTarget;
  component.widgetbox = widgetbox;

  var l_minWidth = 10;
  var l_maxWidth = 10;
  var l_minHeight = 10;
  var l_maxHeight = 10;

  var resizeelem = new goog.ui.Resizable(widgetbox, {
    handles: goog.ui.Resizable.Position.ALL
  });

  $.extend(widgetbox, this);
  goog.events.listen(resizeelem, goog.ui.Resizable.EventType.START_RESIZE,
    callerStartResize, 'false', component);
  goog.events.listen(resizeelem, goog.ui.Resizable.EventType.RESIZE,
    callerResize, 'false', component);
  goog.events.listen(resizeelem, goog.ui.Resizable.EventType.END_RESIZE,
    callerEndResize, 'false', component);
}

callerStartResize = function(e) {
  e.stopPropagation();
  window[this.callbackTarget].startResize(this);
}
callerResize = function() {
  window[this.callbackTarget].resize(this);
}
callerEndResize = function() {
  window[this.callbackTarget].endResize(this);
}



/**
 * return false if the thid._id component is currently resized, true else
 * @return {Boolean} [description]
 */
//TODO possiblement deprecated, à mettre à jour ?
ResizeService.prototype.isResizing = function(component) {
  if ($("#" + component._id).data("isResizabling") === true) {
    logger.info("action prevented because of resize")
    return false;
  }
  return true;
}