resizeModel = function(){
	console.log("resizeModel",this._id,this.id);

	var component = goog.dom.getElement(this.id);
	// console.log("resizeModel",component);

	var size = goog.style.getSize(component
		);
	// console.log("resizeModel",size);

	var ratio;
	if(goog.dom.classes.has(component,'slide')){
		ratio = ratioSlideshowMode;
	} else if(goog.dom.classes.has(component,'element')){
		ratio = ratioContentMode;
	}


	size = {
		height: size.height*ratio,
		width: size.width*ratio
	};
	var id = {_id:this._id};
	var update = {
		$set:{
			'displayOptions.editor.size': size,
			'displayOptions.jmpress.size': size,
		}
	}

	console.log("resizeModel",update.$set);


	/**
	 * Il faut absolument que 
	 */
	if(goog.dom.classes.has(component,'slide')){
		Slides.update(id,update);		
		updateSlidePos.call(this);
	} else if(goog.dom.classes.has(component,'element')){		
		Elements.update(id,update);
		updateElementPos.call(this);
	}

}