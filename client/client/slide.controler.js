	/**
 * binding by goog.listen when initToolbar
 */


//// MIGRATION DONE

createSlideControler = function() {
	logger.info("createSlideControler");
	var d = new Date;
	var title = d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
	createSlide({
		title: title,
		type: 'default'
	});

}







/******* methods ********/


/**
 * Switch to slide content editor mode by adding the slide in CurrentEditing collection, show text
 * editor toolbar and hide timeline and slideshow buttons
 */
editSlideContent = function() {
	if (CurrentEditing.find({}).fetch().length !== 0) {
		throw new Meteor.Error("500", "a slide is already currently editing (or the last currentEditing doesn't terminate properly");
	}
	logger.info("editSlideContent insert ", this._id);
	Session.set("modalCurrentEditing", true);
	CurrentEditing.insert(Slides.findOne({
		_id: this._id
	}));

	displayBlockAccordingToEditorMode('contentMode');

}

updateSlideTitleControler = function() {
	logger.info("updateSlideTitleControler");
	updateWithLocksControler.apply(this, "title", updateSlideTitleModel);
};


doubleClickSlide = function(event){
	logger.info("doubleClickSlide");
	event.stopPropagation();
}