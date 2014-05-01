// Set up a logger.

startResizeElement = function() {
  console.log("startResizeElement", this._id,this.id);
  $("#"+this.id).data("isResizabling",true);
}
resizeElement = function() {
  console.log("resizeElement", this._id,this.id);
  //resizeModel.call(this)

}
endResizeElement = function() {
  console.log("endResizeElement", this._id, this.id);
   $("#"+this.id).data("isResizabling",false);
}


setResize = function(id) {
  console.log("setResize",id);


  // var EVENTS = goog.object.getValues(goog.ui.Component.EventType);
  // var EVENTS2 = goog.object.getValues(goog.ui.Resizable.EventType);



  var widgetbox = goog.dom.getElement(id);

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
  widgetbox.id = id;
  widgetbox._id = id.split('-')[0];
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
isResizing = function() {
    if ($("#" + this._id).data("isResizabling") === true) {
        console.log("action prevent because of resize")
        return false;
    }
    console.log('isResizing',true);
    return true;
}