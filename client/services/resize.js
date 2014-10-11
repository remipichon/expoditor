ResizeService = function(){};

ResizeService.prototype.startResizeElement = function() {
  logger.info("startResizeElement", this._id,this.id);
  $("#"+this.id).data("isResizabling",true);
}

ResizeService.prototype.resizeElement = function() {
  logger.warn("resizeElement DO NOTHING", this._id,this.id);
  //resizeModel.call(this)

}

ResizeService.prototype.endResizeElement = function() {
  logger.info("endResizeElement", this._id, this.id);
  resizeModel.call(this);
   $("#"+this.id).data("isResizabling",false);
}


ResizeService.prototype.setResize = function() {
  logger.info("setResize",this.id);


  // var EVENTS = goog.object.getValues(goog.ui.Component.EventType);
  // var EVENTS2 = goog.object.getValues(goog.ui.Resizable.EventType);



  var widgetbox = goog.dom.getElement(this.id);

  // var resetBox = function(a, b) {
  var l_minWidth = 10;
  var l_maxWidth = 10;
  var l_minHeight = 10;
  var l_maxHeight = 10;

  var resizeelem = new goog.ui.Resizable(widgetbox, {
    handles: goog.ui.Resizable.Position.ALL
  });
  //goog.events.listen(resizeelem, EVENTS, logEvent);
  // goog.events.listen(resizeelem, EVENTS2, logEvent);
  
  $.extend(widgetbox,this);
  goog.events.listen(resizeelem, goog.ui.Resizable.EventType.START_RESIZE, startResizeElement,'false',widgetbox);
  goog.events.listen(resizeelem, goog.ui.Resizable.EventType.RESIZE, resizeElement,'false',widgetbox);
  goog.events.listen(resizeelem, goog.ui.Resizable.EventType.END_RESIZE, endResizeElement,'false',widgetbox);
  // };


  // resetBox();

}

/**
 * return false if the thid._id component is currently resized, true else
 * @return {Boolean} [description]
 */
ResizeService.prototype.isResizing = function() {
    if ($("#" + this._id).data("isResizabling") === true) {
        logger.log("action prevent because of resize")
        return false;
    }
    logger.info('isResizing',true);
    return true;
}