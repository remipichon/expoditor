
Template.slideshowTitle.title= function(){
	if(typeof Slideshow.findOne({}) === 'undefined'){
		return 'no slideshow loaded';
	}
	return Slideshow.findOne({}).informations.title;
}