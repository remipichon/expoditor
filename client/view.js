
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