/***************  EVENTS ***************/

/**
 * switch to slide content editor mode
 */
Template.editSlideContent.events({
	'click': function(event) {
		event.stopPropagation();
		editSlideContent.call(this);
	}
});

Template.editorSlide.events({
	'dblclick': function() {
		updateSlideTitleControler.call(this);
	}
});

Template.deleteSlide.events({
	"click": function() {
		deleteSlide.call(this);
	}
});


SlideControler = function(){};


SlideControler.prototype.createSlideControler = function() {
	logger.info("createSlideControler");
	var d = new Date;
	var title = d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
	return createSlide({
		title: title,
		type: 'default'
	});

}


/**
 * Switch to slide content editor mode by adding the slide in CurrentEditing collection, show text
 * editor toolbar and hide timeline and slideshow buttons
 */
SlideControler.prototype.editSlideContent = function() {
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

SlideControler.prototype.updateSlideTitleControler = function() {
	logger.info("updateSlideTitleControler");
	updateWithLocksControler.apply(this, "title", updateSlideTitleModel);
};


SlideControler.prototype.doubleClickSlide = function(event){
	logger.info("doubleClickSlide");
	event.stopPropagation();
}


SlideControler.prototype.addSlide = function(event) {
    logger.info("addSlide", event.offsetY, event.offsetX)
    createSlide({
        pos: {
            y: event.offsetY * ratioSlideshowMode,
            x: event.offsetX * ratioSlideshowMode
        }
    });

}

GoogDragger.prototype.startDragSlide = function(e) {
    logger.info("GoogDragger.prototype.startDragSlide");
    e.stopPropagation();
    $("#" + this._id).toggleClass('dragged');
}

GoogDragger.prototype.endDragSlide = function(e) {
    logger.info("GoogDragger.prototype.endDragSlide");
    $("#" + this._id).toggleClass('dragged');
    updateSlidePos.call(this);
}

GoogDragger.prototype.dragSlide = function(e) {
    logger.info("GoogDragger.prototype.dragSlide");
    updateSlidePos.call(this);
}
