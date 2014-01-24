if (Meteor.isClient) {
    var subscriptionSlide = Meteor.subscribe("slides");
    Meteor.subscribe("slidesLock");

    Slides = new Meteor.Collection("slides");
    SlidesLock = new Meteor.Collection("slidesLock");

    Meteor.startup(function() {
    });

    Template.hello.greeeting = function() {
        return "Click to create some slides";
    };

    //create a slide
    Template.createPlaneSlide.events({
        'click input': function() {
            var d = new Date;
            var title = d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
            createSlide({title: title, type: 'planeSlide'});
        }
    });

    Template.createJmpressSlide.events({
        'click input': function() {
            var d = new Date;
            var title = d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
            createSlide({title: title, type: 'jmpressSlide'});
        }
    });

    //subscribe to plane or jmpress or all (exclu)
    Template.loadAllSlide.events({
        'click input': function() {
            subscriptionSlide.stop();
            subscriptionSlide = Meteor.subscribe("slides");
        }
    });
    Template.loadPlaneSlide.events({
        'click input': function() {
            subscriptionSlide.stop();
            subscriptionSlide = Meteor.subscribe("planeSlides");
        }
    });
    Template.loadJmpressSlide.events({
        'click input': function() {
            subscriptionSlide.stop();
            subscriptionSlide = Meteor.subscribe("jmpressSlides");
        }
    });

    //init slideArea with all slides presents in db
    Template.slideArea.slides = function() {
        return Slides.find({});
    };

    //callback of render to add draggable and fadeInt when first render
    Template.slide.rendered = function() {
        //console.log("slide rendered");
        var self = this;
        $(self.find(".slide")).draggable();
        if (self.data.toFadeIn) { //pour ne fadeIn qu'une fois
            $("#" + self.data._id).fadeOut(0).fadeIn(1000);  //petite magouille
            self.data.toFadeIn = false;
        }

        var left = self.data.left;
        var top = self.data.top;
        $(self.find(".slide")).css("left", left).css("top", top);
        // BAD BAD BAD BAD BAD il faut trouver un moyen pour que ce soit meteor qui s'en charge ! 
        $(self.find(".slide")).children('.title').html(self.data.title);
    };

    //petite magouille in order to fadeInt when create only
    Template.slide.created = function() {
        this.data.toFadeIn = true;
    };

    //update title
    Template.slide.events({
        'dblclick': function() {
            //mise en place du lock si slide dispo
            var userId = Meteor.userId();
            var lock = SlidesLock.findOne({slideId: this._id});
            if (typeof lock == 'undefined' || lock.userId == null) {
                if (typeof lock == 'undefined') {
                    SlidesLock.insert({slideId: this._id, userId: userId, type: 'title', slideTitle: this.title});
                } else {
                    SlidesLock.update(
                            SlidesLock.findOne({slideId: this._id})._id,
                            {$set: {
                                    userId: userId, type: 'title', slideTitle: this.title //, slideId: this._id
                                }});
                }
                console.log("update title, add lock to slide", this._id);
                updateSlideTitle(this);
            } else {
                alert("lock set by " + lock.userId);
            }



        }
    });

    //update pos on move
    Template.slide.events({
        'mousedown, mousemove': function(event) {
            updateSlidePosMove(this, event);
        }
    });

    //update pos slide at the end of a move
    Template.slide.events({
        'mouseup': function(event) {
            updateSlidePos(this, event);
        }
    });

    //try : catch delete to add fadeOut (doen't work on others clients)
    Template.deleteSlide.events({
        'click': function(event) {
            event.stopPropagation();
            var self = this;
            $("#" + this._id).fadeOut(1000, function() {
                console.log("delete slide");
                Slides.remove(self._id);
            });
        }
    });
}




createSlide = function(options) {
    var top = 50;
    var left = 50;
    return  Slides.insert({title: options.title, top: top, left: left, type: options.type});
};

updateSlideTitle = function(slide) {
    console.log("update title");
    var title = prompt("new title", slide.title);
    console.log("update title : remove lock of slide", slide._id);

    if (title != null) {
        //cancel, pas d'update
        Slides.update(slide._id, {$set:
                    {title: title}
        });
    }

    //supression du lock
    SlidesLock.update(
            SlidesLock.findOne({slideId: slide._id})._id,
            {$set:
                        {userId: null}
            });
};

updateSlidePos = function(slide, event) {
    var $slide = $("#" + slide._id);
    var top = $slide.css('top');
    var left = $slide.css('left');

    return Slides.update(slide._id, {$set:
                {top: top, left: left}
    });
};


updateSlidePosMove = function(slide, event) {
    var $slide = $("#" + slide._id);
    var newTop = parseInt($slide.css('top'));
    var newLeft = parseInt($slide.css('left'));

    //histoire de pas trop surcharger le server, on update pas tout le temps
    var slideDb = Slides.findOne({_id: slide._id});
    var oldTop = parseInt(slideDb.top);
    var oldLeft = parseInt(slideDb.left);
    //console.log("newTop",newTop,"oldTop",oldTop);

    var distance = Math.sqrt(
            Math.pow(newTop - oldTop, 2) + Math.pow(newLeft - oldLeft, 2)
            );

    //trop courte
    if (distance < 5) {
        //console.log("skip update",distance);
        return;
    }

    Slides.update(slide._id, {$set:
                {top: newTop, left: newLeft}
    });
};







