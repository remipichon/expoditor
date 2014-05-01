resizeModel = function(){
	console.log("resizeModel",this._id,this.id);

	var component = goog.dom.getElement(this.id);
	// console.log("resizeModel",component);

	var size = goog.style.getSize(component
		);
	// console.log("resizeModel",size);

	size = {
		height: size.height,
		width: size.width
	};
	var id = {_id:this._id};
	var update = {
		$set:{
			'displayOptions.editor.size': size,
			'displayOptions.jmpress.size': size,
		}
	}

	console.log("resizeModel",update.$set);

	

	if(goog.dom.classes.has(component,'slide')){
		Slides.update(id,update);
	} else if(goog.dom.classes.has(component,'element')){
		Elements.update(id,update);
	}

}