if (Meteor.isClient) {
    subscriptionSlide = Meteor.subscribe("slides");
    Session.set("slideSubscription", "slides");
    Meteor.subscribe("slidesLock");
    Meteor.subscribe("remoteSlides");

    Slides = new Meteor.Collection("slides");
    SlidesLock = new Meteor.Collection("slidesLock");
    RemoteSlides = new Meteor.Collection("remoteSlides");

    Slideshow = null; //set with getSlideshow
    subscriptionSlideshow = null; //idem


    Meteor.startup(function() {
        //listener jquery
        //keypress ne fire pas les arrow sont webkit et IE
        $(document).on("keypress", function(event) {
            if (Session.get("slideSubscription") === "jmpressSlides") {
                var activeSlide = $("#slideArea .active").attr("id");
                switch (event.keyCode) {
                    case 37: // left
                        setActive(activeSlide);
                        break;
                    case 38: // up
                        setActive(activeSlide);
                        break;
                    case 39: // right
//                        console.log("right arrow");
                        setActive(activeSlide);
                        break;
                    case 8: // space
//                        console.log("space");
                        setActive(activeSlide);
                        break;
                    case 32 : // space
//                        console.log("space");
                        setActive(activeSlide);
                        break;
                    case 40: // down
                        setActive(activeSlide);
                        break;
                    default:
                        return; // exit this handler for other keys
                }
            }
        });
    });


    //pour ecoute les changements dans la souscription remoteSlide
    //suppression du active de la derniere slide
    Deps.autorun(function() {
        var remote = RemoteSlides.find({state: "active"}).fetch();
        if (typeof remote[0] !== "undefined") { //pour eviter une erreur la premeire fois

            var type = Session.get("slideSubscription");
            if (type === "jmpressSlides") {
                console.log("follow slide !");
                $("#slideArea").jmpress("goTo", "#" + remote[0].slideId)
            } else {
                console.log("remote slide active state changed to ", remote[0].slideId);
                var $slide = $("#" + remote[0].slideId);

                $(".slide.active").removeClass("active");
                $slide.addClass("active");
            }
        }


    });
    //fonctionne pas parce que la slide est en constant
    //provoque un render de chaque slide jmpress
    //il me semble que c'est parce qu'à cause de ca les dependances de isActive chnge à chaque fois
    //que remote est update
    Template.slide.isActive = function() {
        if (Session.get("slideSubscription") === "jmpressSlide")
            return "";
        var remote = RemoteSlides.find({state: "active"}).fetch();
        if (typeof remote[0] !== "undefined") { //pour eviter une erreur la premeire fois
            if (this._id === remote[0].slideId) {
                return "active";
            } else {
                return "";
            }
        }
    };

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
            subscriptionSlide = Meteor.subscribe("slides");
            Session.set("slideSubscription", "slides");
        }
    });

    Template.loadJmpressSlide.events({
        'click input': function() {
            subscriptionSlide.stop();
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

    Template.slide.destroyed = function() {
        console.log("slide destroyed", this.data._id);
        //si un detruit une slide de jmpress, il faut l'enlever du DOM
        if (Session.get("slideSubscription", "jmpressSlides")) { //je comprend pas pourquoi c'est fire à chaque fois, mais ca pose pas de probleme alors je verra plus tard
            console.log("       slide jmpress removed");
            $("#" + this.data._id).remove();
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
    console.log("create ", options.type);
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

    //pass bien du tout, ce devrai etre au server de faire cela !
    //
    //petite verif qu'on se superpose pas avec une slide
    var closer = getCloserSlide(slide._id, {x: newLeft + "px", y: newTop});
//    console.log(closer.length);
//    console.log(slide._id,  newTop, newLeft, closer);
//    console.log(getCloserSlide(slide._id, {x: newTop, y: newLeft}));
    if (closer.length != 0) {
        console.log("updateSlidePosMove : trop proche d'une slide")
        return;
    }

    return Slides.update(slide._id, {$set:
                {top: top, left: left}
    });
};


updateSlidePosMove = function(slide, event) {
    var $slide = $("#" + slide._id);
    var newTop = parseInt($slide.css('top'));
    var newLeft = parseInt($slide.css('left'));

    //petite verif qu'on se superpose pas avec une slide
    var closer = getCloserSlide(slide._id, {x: newLeft + "px", y: newTop});
//    console.log(closer.length);
//    console.log(slide._id,  newTop, newLeft, closer);
//    console.log(getCloserSlide(slide._id, {x: newTop, y: newLeft}));
    if (closer.length != 0) {
        console.log("updateSlidePosMove : trop proche d'une slide");
        //  return;
    }



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





setActive = function(activeSlide) {
    //suppression de l'ancienne active
    if (typeof RemoteSlides.findOne({state: "active"}) != "undefined") {
        RemoteSlides.update(
                RemoteSlides.findOne({state: "active"})._id,
                {$set:
                            {state: null}
                });
    }

    //ajout de la nouvelle active
    RemoteSlides.update(
            RemoteSlides.findOne({slideId: activeSlide})._id,
            {$set:
                        {state: "active"}
            });

};


//getCloserSlide = function(slideID, pos) {
//    //connecter cela au ratio et au css
//    var H = 70; //height
//    var W = 90; //width
//
//    //pour retourner uniquement les slides proche de la slide dont la pos est passée en parametre
//    return Slides.find({
//        $where: function() {
//            return this._id !== slideID && (Math.pow(W, 2) + Math.pow(H, 2) > Math.pow(parseInt(pos.x) - parseInt(this.left), 2) + Math.pow(parseInt(pos.y) - parseInt(this.top), 2));
//        }
//    }).fetch();
//};


//pour test
/*
 $slide = $("#msZP8jhhaE97f7cKR");
 var pos = {x: $slide.css("left"), y: $slide.css("top")};
 getCloserSlide(pos);
 */

testCallClient = function(str) {
    console.log("call server");
    Meteor.call('testCallServer', str, function(error, result) {
        console.log("server answered with ", result);
    });
};


createSlideshow = function(options) {
    console.log("createSlideshow ", options);
    Meteor.call('createSlideshow', options, function(error, result) {
        if (typeof error !== "undefined") {
            console.log("createSlideshow : create error ", error);
        } else {
            console.log("createSlideshow ", result);
            getSlideshow({title: options.title, presentationMode: "default"});
        }
    });
};

/*
 * update things that ar note slide
 // */
//updateSlideshow = function(options){
//    if( typeof options.slide !== "undefined"){
//        console.log("updateSlideshow : you cannot update slide with this function");
//        return;
//    }
//    if( typeof options.presentationMode === "undefined"){
//        console.log("updateSlideshow : presentationMode undefined");
//        return;
//    }
//    
//    //il n'y a qu'une presentation sur le client
//    Slideshow.update(Slideshow.findOne({})._id, {
//       'presentationMode': options.presentationMode
//    });
//    
//};


getSlideshow = function(options) {
    console.log("getSlideshow ", options);
    Meteor.call("getSlideshow", options, Meteor.userId(), function(error, result) {
        if (typeof error !== "undefined") {
            console.log("getSlideshow : get error ", error);
        } else {
            //arret de la precedente si existante
            if (subscriptionSlideshow !== null)
                subscriptionSlideshow.stop();

            //nouvelle sub
            subscriptionSlideshow = Meteor.subscribe(options.title);

            if (Slideshow === null)
                Slideshow = new Meteor.Collection("slideshow");


            //sub de lock
            //sub de remote

            console.log("getSlideshow ", result, ": done with subscribes");
        }
    });
};