if (Meteor.isClient) {
    var subscriptionSlide = Meteor.subscribe("slides");
    Session.set("slideSubscription", "slides");
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
            $("#slideArea").jmpress("deinit");
            subscriptionSlide.stop();            
//            $("#slideArea").empty();
//function(){$("#slideArea").empty();}

            subscriptionSlide = Meteor.subscribe("slides");
            
            Session.set("slideSubscription", "slides");
        }
    });
    Template.loadPlaneSlide.events({
        'click input': function() {
            $("#slideArea").jmpress("deinit");
            subscriptionSlide.stop();
            
            subscriptionSlide = Meteor.subscribe("planeSlides");
            
            Session.set("slideSubscription", "planeSlides");
        }
    });
    Template.loadJmpressSlide.events({
        'click input': function() {
            subscriptionSlide.stop();
//            initJmpress();

            subscriptionSlide = Meteor.subscribe("jmpressSlides");
            
            Session.set("slideSubscription", "jmpressSlides");
            //magouille parce que le callback de subscribe n'est pas un callback de Template.render (lui meme étant un callback)
            setTimeout(initJmpress, 200);

        }
    });

    //init slideArea with all slides presents in db
    Template.slideArea.slides = function() {
        return Slides.find({});
    };

    //callback of render to add draggable and fadeInt when first render
    Template.slide.rendered = function() {
        //une bonne partie de cela devrait disparaitre lorsque le draggable de jquery sera enlevé        
        //BAD BAD BAD BAD BAD il faut trouver un moyen pour que ce soit meteor qui s'en charge !
        self = this;
        var $slide = $(self.find(".slide"));
        var $slide = $("#" + this.data._id);
        var left = self.data.left;
        var top = self.data.top;
        var ratio = 10;

        //pour toutes
        if (self.data.toFadeIn) { //pour ne fadeIn qu'une fois
            $("#" + self.data._id).fadeOut(0).fadeIn(1000);  //petite magouille
            self.data.toFadeIn = false;
        }
        //title
        $slide.children('.title').html(self.data.title);

        //pos CSS (mode draggable) et jmpress       
        $slide.attr("data-x", parseInt(left) * ratio).attr("data-y", parseInt(top) * ratio);

        var type = Session.get("slideSubscription");
        if (type === "planeSlides" || type === "slides") {
            //pour plane
            console.log("render plane et all");
            $slide.css("left", left).css("top", top);
            $slide.draggable();
        }

        if (type === "jmpressSlides") {
            //pour jmpress
            console.log("render jmpress");
            //pas top
            $slide.css("left", 0).css("top", 0);

            //lors de l'abonnement, on crée toutes les slides d'un coup puis jmpress passe par là.
            //donc on ne reinit les slides qu'au rerender (je crois qu'il y a un astuce meteor pour m'eviter de faire ca)
            if ($("#slideArea").jmpress('initialized')) {

                //encore une magouille. Si #slideArea a plus d'un fils c'est que $slide en est un, il faut donc la deplacer dans le div container de camera jmpress
                if ($("#slideArea >").length != 1) {
                    $("#slideArea div:not(.slide)").append($slide);
                }

                console.log("init de la slide");
                //deplacement de slide
//            $("#slideArea >").append($slide);
                $("#slideArea").jmpress('init', $slide);
            }
        }


    };

    //petite magouille in order to fadeInt when create only
    Template.slide.created = function() {
        this.data.toFadeIn = true;
    };
    
    Template.slide.destroyed = function(){
        console.log("slide destroyed", this.data._id);
        //si un detruit une slide de jmpress, il faut l'enlever du DOM
        if( Session.get("slideSubscription","jmpressSlides") ){ //je comprend pas pourquoi c'est fire à chaque fois, mais ca pose pas de probleme alors je verra plus tard
            console.log("       slide jmpress removed");
            $("#"+this.data._id).remove();
        }
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


    //template method
    Template.slide.getJmpressData = function(axis) { //pas encore utilisé à cause du draggable de jqueryreu
        var ratio = 10;
        switch (axis) {
            case "x":
                var coord = parseInt(this.left) * ratio;
                break;
            case "y":
                var coord = parseInt(this.top) * ratio;
                break;
            case "z":
                var coord = 0;
                break;
            default:
                return "";

        }
        return 'data-' + axis + '="' + coord + '"';
    };
}


initJmpress = function() {
    console.log("init jmpress");
    //preparer toutes les slides, ajout les attributs data-
//    $('#slideArea .slide').each(function(index, slide) {
//        var $slide = $(slide);
//        $slide.attr("data-x", parseInt($slide.css("left")) * 10);
//        $slide.attr("data-y", parseInt($slide.css("top")) * 10);
//        $slide.attr("data-z", 0);
////     $slide.removeAttr("style");
//        $slide.children('.title').removeClass("title").addClass("H1Text");
//    });


    //lancer jmpress
    $('#slideArea').jmpress({
        viewPort: {
            height: 400,
            width: 3200,
            maxScale: 1
        }
    });
};



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







