GoogDragger = function(){};

/**
 * add draggable on dragged by dragger and give component to start/drag/end callback 
 * function as first params	
 * @param  {googelement} dragged   dom element dragged
 * @param  {googElement} dragger   from which the dragged is dragged
 * @param  {???} component   data to give to event callbacks
 * @params 	{string}  callbackTarget   string name of the object which will handle the events callback
 *          			This object must have : startDrag(component), drag(component), endDrag(component)
 *  */
GoogDragger.prototype.init = function(dragged, dragger,component, callbackTarget){
	if(typeof window[callbackTarget] !== "object" ){
		logger.error(callbackTarget,"doesn't exist in the window scope");
		return;
	}
	component.callbackTarget = callbackTarget;

	var dragger = new goog.fx.Dragger(dragged, dragger);
    goog.events.listen(dragger, goog.fx.Dragger.EventType.START, 
    	callerStartDrag, 'false', component);
    goog.events.listen(dragger, goog.fx.Dragger.EventType.DRAG, 
    	callerDrag, 'false', component);
    goog.events.listen(dragger, goog.fx.Dragger.EventType.END, 
    	callerEndDrag, 'false', component);


}

callerStartDrag = function(e){
    e.stopPropagation();
    window[this.callbackTarget].startDrag(this);
}
callerDrag = function() {
     window[this.callbackTarget].drag(this);
}
callerEndDrag = function() {
     window[this.callbackTarget].endDrag(this);
}