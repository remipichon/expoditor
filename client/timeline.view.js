Template.timeline.slides = function() {
	return Slides.find({}, {
		sort: {
			order: 1
		}
	})
}

Template.clonedTimeline.slides = function() {
	return Slides.find({}, {
		sort: {
			order: 1
		}
	})
}

/*
Slides.find({}).observeChanges({
	added: function(_id) {

	},
	changed: function(_id, fields) {
		//un peu lourd mais je vois que cela pour le moment
		$(Slides.find({}, {
			sort: {
				order: 1
			}
		}).fetch()).each(function() {
			//on refait l'ordre de la timeline (très lourd)
			var slideTimeline = $("#timeline-slide " + this._id + "-timeline")
			//$("#timeline-slide").append(slideTimeline);
			//on maj les data-pos
			//slideTimeline.data("data-pos", this.order);
			//var clone = slideTimeline.data("clone");
			//clone.data("data-pos", this.order);

		});

	},
	removed: function(_id) {
		$("#" + _id + '-timeline').remove();
		$("#" + _id + '-timeline-cloned').remove();
		console.log("removeclone and timelineslide", _id);
		setSortable();
	}
})
*/

Template.timelineSlide.destroyed = function() {
    console.log("timelineSlide.destroyed");
    updateOrderControler();

}


Template.timelineSlide.rendered = function() {

	// settimelineOnSlide = function() {
	// console.log("render timelineslide");
	// var setToTimeline = false;
	//ca me saoul mais je mets cela là quand meme
	if (typeof $("#timeline").data("timelineSlide") === "undefined") {
		$("#timeline").data("timelineSlide", "");
	}

	if(typeof $("#" + this.data._id).data("timelineIsSet") !== 'undefined'){  //je crois que ca ne sert jamais
		setToTimeline = false;
	}
	if ($("#timeline").data("timelineSlide").indexOf(this.data._id) === -1) {
		setToTimeline = true;
	}


	if (setToTimeline) {
		console.log("render timelineslide for editor", this.data._id);

		//ajout à la timeline
		//c'est pas top parce que la premiere fois on setSortable pour chaque slide 
		this._id = this.data._id;
		this.id = this.data._id + "-timeline";
		cloneSlide.apply(this, [this.data.order, true]);

		$("#" + this.data._id).data("timelineIsSet", true);
		$("#timeline").data("timelineSlide", $("#timeline").data("timelineSlide") + "-" + this.data._id);
	} else {
		console.log("render timelineslide for editor SKIPPED", this.data._id);
	}
}

/**
 * suppression du clone
 * @return {[type]} [description]
 */
/*Template.timelineSlide.destroyed = function(){
	$("#"+this.data._id+'-timeline-cloned').remove();
	console.log("removeclone",this.data._id+'-timeline-cloned');
	setSortable();
}*/