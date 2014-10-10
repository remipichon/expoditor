/**
 * MIGRATION DONE
 */

resizeModel = function(){
	logger.info("resizeModel",this._id,this.id);

	var component = goog.dom.getElement(this.id);

	var size = goog.style.getSize(component);

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

	var updatePos = updateElementPos.apply(this,[true]);
	logger.info("resizeModel updatepos",updatePos);
	jQuery.extend(update.$set,updatePos.$set);


	logger.info("resizeModel",update.$set);


	/**
	 * Il faut absolument que 
	 */
	if(goog.dom.classes.has(component,'slide')){
		Slides.update(id,update);			
	} else if(goog.dom.classes.has(component,'element')){		
		Elements.update(id,update);
	}

}