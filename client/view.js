
Template.slideshowTitle.slideshowTitle= function(){
	if(typeof Slideshow.findOne({}) === 'undefined'){
		return 'no slideshow loaded';
	}
	return Slideshow.findOne({}).informations.title;
}


Template.slideshowTitle.slideTitle= function(){
	if(typeof CurrentEditing.findOne({}) === 'undefined'){
		return null;
	}
	return '>> '+CurrentEditing.findOne({}).informations.title;
}


Slideshow.find({}).observeChanges({
	added: function(){
		console.log("slideshow added");
		_.each(buttonWhenSlideshow,function(id){
			toolbarButton.getChild(id).setEnabled(true);
		});
		
	},
	removed: function(){
		console.log("slideshow removed");
		_.each(buttonWhenSlideshow,function(id){
			toolbarButton.getChild(id).setEnabled(false);
		});
	}
})