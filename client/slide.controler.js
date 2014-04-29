Template.createSlide.events({
	'click input': function() {
		var d = new Date;
		var title = d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
		createSlide({
			title: title,
			type: 'default'
		});
	}
});

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



/******* methods ********/


/**
 * Switch to slide content editor mode by adding the slide in CurrentEditing collection, show text 
 * editor toolbar and hide timeline and slideshow buttons
 */
editSlideContent = function() {
	if (CurrentEditing.find({}).fetch().length !== 0) {
		throw new Meteor.Error("500", "a slide is already currently editing (or the last currentEditing doesn't terminate properly");
	}
	console.log("editSlideContent insert ", this._id);
	Session.set("modalCurrentEditing", true);
	CurrentEditing.insert(Slides.findOne({
		_id: this._id
	}));

	goog.style.setOpacity(goog.dom.getElement('toolbar'), '1');
	// goog.style.setOpacity(goog.dom.getElement('buttons'), '0');
	goog.style.setStyle(goog.dom.getElement('buttons'), 'display', 'none');
	goog.style.setOpacity(goog.dom.getElement('timeline'),'0');

	//TODO pas propre cela, call this ailleurs
	//setTimeout(resizeModalCurrentEditing, 100);

}

updateSlideTitleControler = function() {
    updateWithLocksControler.apply(this, "title", updateSlideTitleModel);
};