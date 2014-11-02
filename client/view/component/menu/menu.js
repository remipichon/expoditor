/********************** INJECT DATA **********************/

Template.slideshowTitle.slideshowTitle = function() {
	//log.info("Template.slideshowTitle.slideshowTitle");
	if (typeof Slideshow.findOne({}) === 'undefined') {
		return 'no slideshow loaded';
	}
	return Slideshow.findOne({}).informations.title;
}


Template.slideshowTitle.slideTitle = function() {
	//logger.info("Template.slideshowTitle.slideTitle");
	if (typeof CurrentEditing.findOne({}) === 'undefined') {
		return null;
	}
	return '>> ' + CurrentEditing.findOne({}).informations.title;
}

Meteor.startup(function() {
	Slideshow.find({}).observeChanges({
		added: function() {
			logger.info("Slideshow.find({}).observeChanges.added");
			_.each(buttonWhenSlideshow, function(id) {
				toolbarButton.getChild(id).setEnabled(true);
			});

		},
		removed: function() {
			logger.info("Slideshow.find({}).observeChanges.removed");
			_.each(buttonWhenSlideshow, function(id) {
				toolbarButton.getChild(id).setEnabled(false);
			});
		}
	});
});