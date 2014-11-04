/***************  EVENTS ***************/

/**
 * switch to slide content editor mode
 */
Template.editSlideContent.events({
	'click': function(event) {
		event.stopPropagation();
		slideControler.editContent(this);
	}
});

// Template.editorSlide.events({
// 	'dblclick': function() {
// 		slideControler.updateTitle(this);
// 	}
// });

Template.deleteSlide.events({
	"click": function() {
		slideControler.delete(this);
	}
});


SlideControler = function() {};
SlideControler.security = {};

SlideControler.prototype.create = function() {
	var d = new Date;
	var title = d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();

	var sl = new SlideDAO();
	sl.title = title;
	sl.type = "default";
	sl.create();
}


/**
 * Switch to slide content editor mode by adding the slide in CurrentEditing collection, show text
 * editor toolbar and hide timeline and slideshow buttons
 */
SlideControler.prototype.editContent = function(slide) {
	if (CurrentEditing.find({}).fetch().length !== 0) {
		throw new Meteor.Error("500", "a slide is already currently editing (or the last currentEditing doesn't terminate properly");
	}
	Session.set("modalCurrentEditing", true);
	CurrentEditing.insert(Slides.findOne({
		_id: slide._id
	}));

	displayBlockAccordingToEditorMode('contentMode');
}


SlideControler.security.updateTitle = {
    field: ["title"]
}
SlideControler.prototype.updateTitle = function(slide) {
	var sl = new SlideDAO(slide._id);
	var newTitle = prompt("Type a new title", slide.informations.title);
	if (typeof newTitle !== "undefined" && newTitle !== "" && newTitle !== slide.informations.title) {
		sl.informations = {
			title: newTitle
		};
		sl.updateTitle();
	}
	logger.info("SlideControler.updateTitle ", "noUpdate");
};


SlideControler.prototype.doubleClick = function(event) {

	event.stopPropagation();
}


SlideControler.prototype.create = function(event) {
	var sl = new SlideDAO();
	sl.pos = {
		y: event.offsetY * positionService.ratioSlideshowMode,
		x: event.offsetX * positionService.ratioSlideshowMode
	}
	sl.create();
}

SlideControler.prototype.delete = function(slide) {
	var sl = new SlideDAO(slide._id);
	sl.delete();
}

SlideControler.prototype.drag = function(self) {
	var sl = this._getDomPosSize(self);
	sl.updatePos();
}

SlideControler.prototype.startDrag = function(self) {
	$("#" + this._id).toggleClass('dragged');
}

SlideControler.prototype.endDrag = function(self) {
	$("#" + this._id).toggleClass('dragged');
	this.drag(self);
}

SlideControler.prototype._getDomPosSize = function(self) {
	var sl = new SlideDAO(self._id);

	var $slide = $("#" + self._id);
	var top = parseFloat($slide.css('top'));
	var left = parseFloat($slide.css('left'));


	sl.CSS = {
		top: top,
		left: left
	};
	sl.size = {
		width: parseFloat(self.displayOptions.editor.size.width),
		height: parseFloat(self.displayOptions.editor.size.height)
	}

	return sl;

}