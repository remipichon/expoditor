if (Meteor.isClient) {
//    subscriptionSlide = Meteor.subscribe("slides");
//    Session.set("slideSubscription", "slides");
    Meteor.subscribe("slidesLock");
    Meteor.subscribe("remoteSlides");

//    Slides = new Meteor.Collection("slides");
    SlidesLock = new Meteor.Collection("slidesLock");
    RemoteSlides = new Meteor.Collection("remoteSlides");

    Slideshow = null; //set with getSlideshow
    subscriptionSlideshow = null; //idem


    ///test

    Slideshow = new Meteor.Collection("slideshow");
//    subscriptionSlideshow =  Meteor.subscribe("test4");

    //init slideArea with all slides presents in db
    Template.slideArea.slideshow = function() {
//        if(typeof  Slideshow.findOne({}) !== "undefined")
//            return Slideshow.findOne({}).slides;
        return Slideshow.find({});
    };

    ///fin test


    Meteor.startup(function() {
        //listener jquery
        //keypress ne fire pas les arrow sont webkit et IE
        $(document).on("keypress", function(event) {
            if (Session.get("clientMode") === "jmpress") {
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

        console.log("init pres pour test");
        Session.set("clientMode", "editor");
        getSlideshow({title: 'test5'});

    });


    //pour ecoute les changements dans la souscription remoteSlide
    //suppression du active de la derniere slide
    Deps.autorun(function() {
        var remote = RemoteSlides.find({state: "active"}).fetch();
        if (typeof remote[0] !== "undefined") { //pour eviter une erreur la premeire fois

            var type = Session.get("clientMode");
            if (type === "jmpress") {
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
        if (Session.get("clietMode") === "jmpress")
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


    Template.createSlide.events({
        'click input': function() {
            var d = new Date;
            var title = d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
            createSlide({title: title, type: 'default'});
        }
    });

    //subscribe to plane or jmpress or all (exclu)
    Template.loadEditor.events({//a revoir
        'click input': function() {
            $("#slideArea").jmpress("deinit");
            Session.set("clientMode", "editor");
            var title = prompt("load slideshow :", Slideshow.findOne({}).informations.title);
            subscriptionSlideshow.stop();
            getSlideshow({title: title});

        }
    });

    Template.loadJmpress.events({//a revoir
        'click input': function() {
//            subscriptionSlide.stop();
//            subscriptionSlide = Meteor.subscribe("jmpressSlides");
//            Session.set("slideSubscription", "jmpressSlides");
            Session.set("clientMode", "jmpress");
            var title = prompt("load slideshow :", Slideshow.findOne({}).informations.title);
            subscriptionSlideshow.stop();
            getSlideshow({title: title});

            //magouille parce que le callback de subscribe n'est pas un callback de Template.render (lui meme étant un callback)
            setTimeout(initJmpress, 200);

        }
    });



    //callback of render to add draggable and fadeInt when first render
    Template.slide.rendered = function() {

        //une bonne partie de cela devrait disparaitre lorsque le draggable de jquery sera enlevé        
        //BAD BAD BAD BAD BAD il faut trouver un moyen pour que ce soit meteor qui s'en charge !
        self = this;
        var $slide = $(self.find(".slide"));
        var $slide = $("#" + this.data._id);
        var left = self.data.displayOptions.jmpress.positions.x;
        var top = self.data.displayOptions.jmpress.positions.y;
        console.log("render new pos ", left, top);
        var ratio = 10;

//        //pour toutes
//        if (self.data.toFadeIn) { //pour ne fadeIn qu'une fois
//            $("#" + self.data._id).fadeOut(0).fadeIn(1000);  //petite magouille
//            self.data.toFadeIn = false;
//        }
        //title
        $slide.children('.title').html(self.data.informations.title);

        //pos CSS (mode draggable) et jmpress       
        $slide.attr("data-x", parseInt(left) * ratio).attr("data-y", parseInt(top) * ratio);

        var type = Session.get("clientMode");
        if (type === "editor") {
            //pour plane
            console.log("render for editor");
            $slide.css("left", left).css("top", top);
            $slide.draggable();
        }

        if (type === "jmpress") {
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
        if (Session.get("clientMode", "jmpress")) { //je comprend pas pourquoi c'est fire à chaque fois, mais ca pose pas de probleme alors je verra plus tard
            console.log("       slide jmpress removed");
            $("#" + this.data._id).remove();
        }
    };

    //update title
    Template.slide.events({
        'dblclick': function() {

            updateSlideTitleControler(this);



        }
    });

    //update pos on move
    Template.slide.events({
        'mousemove': function(event) {
            if (event.which == 1) {
                updateSlidePosMove(this, event);
            }

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
    Template.slide.getPresentationData = function(axis, technoSlideshow) { //pas encore utilisé à cause du draggable de jqueryreu
        if (technoSlideshow === "jmpress") {
            var ratio = 10;
            switch (axis) {
                case "x":
                    var coord = parseInt(this.displayOptions.jmpress.positions.x) * ratio;
                    break;
                case "y":
                    var coord = parseInt(this.displayOptions.jmpress.positions.y) * ratio;
                    break;
                case "z":
                    var coord = 0;
                    break;
                default:
                    return "";

            }
//            console.log(coord, parseInt(this.displayOptions.jmpress.positions.y));
            return 'data-' + axis + '=' + coord + '';
        }
    };

    //template method
    Template.slide.getEditorData = function(axis) { //pas encore utilisé à cause du draggable de jqueryreu
        truc = this;
        var ratio = 1;
        switch (axis) {
            case "x":
                var coord = parseInt(this.displayOptions.jmpress.positions.x) * ratio;
                break;
            case "y":
                var coord = parseInt(this.displayOptions.jmpress.positions.y) * ratio;
                break;
            case "z":
                var coord = 0;
                break;
            default:
                return "";

        }
        return coord;
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
//    return  Slides.insert({title: options.title, top: top, left: left, type: options.type});
    return Slideshow.update(
            {_id: Slideshow.findOne({})._id},
    {$push: {
            slides: {
                _id: Random.id(),
                informations: {
                    title: options.title
                },
                displayOptions: {
                    jmpress: {
                        positions: {
                            x: left,
                            y: top,
                            z: 0
                        },
                        rotates: {
                            x: 0,
                            y: 0,
                            z: 0
                        }
                    }
                }
            }
        }
    }
    );
};


updateSlideTitleControler = function(slide) {
    //mise en place du lock si slide dispo
    var userId = Meteor.userId();
    var lock = SlidesLock.findOne({slideId: slide._id});
    if (typeof lock == 'undefined' || lock.userId == null) {
        if (typeof lock == 'undefined') {
            SlidesLock.insert({slideId: slide._id, userId: userId, type: 'title', slideTitle: slide.informations.title});
        } else {
            SlidesLock.update(
                    SlidesLock.findOne({slideId: slide._id})._id,
                    {$set: {
                            userId: userId, type: 'title', slideTitle: slide.informations.title //, slideId: this._id
                        }});
        }
        console.log("update title, add lock to slide", slide._id);
        updateSlideTitleModel(slide);
    } else {
        alert("lock set by " + lock.userId);
    }

};


updateSlideTitleModel = function(slide) {
    console.log("update title, model");
    var title = prompt("new title", slide.informations.title);

    if (title != null) {
        //obligé de passer par l'index afin d'éviter //Not permitted. Untrusted code may only update documents by ID. [403]
        var slideIndex = getIndexOfSlide(slide); //pas aussi simple, il faut extraire slide.id et le chercher dans les elements de .slides

        var query = {};                 // create an empty object
        query['slides.' + slideIndex + '.informations.title'] = title;  // and then populate the variable key

        Slideshow.update(
                {_id: Slideshow.findOne({})._id},
        {
            $set: query  //attention, c'est un $set donc ca écrase tout ce qui est maché 
        }
        );

    }
    console.log("update title : remove lock of slide", slide._id);

    //supression du lock
    SlidesLock.update(
            SlidesLock.findOne({slideId: slide._id})._id,
            {$set:
                        {userId: null}
            });
};

updateSlidePos = function(slide, event) {
//    return;
    var $slide = $("#" + slide._id);
    var top = parseInt($slide.css('top'));
    var left = parseInt($slide.css('left'));
    var pos = {
        x: left,
        y: top,
        z: 0
    };


    //petite verif que la slide a effectivement bougée
    if (slide.displayOptions.jmpress.positions.x == left && slide.displayOptions.jmpress.positions.y == top) {
        console.log("updateSlidePosMove : slide didn't really move");
        return;
    }



    //pass bien du tout, ce devrai etre au server de faire cela !
    //petite verif qu'on se superpose pas avec une slide
//    var closer = getCloserSlide(slide._id, {x: left + "px", y: top});
//    console.log(closer.length);
//    console.log(slide._id,  newTop, newLeft, closer);
//    console.log(getCloserSlide(slide._id, {x: newTop, y: newLeft}));
//    if (closer.length != 0) {
//        console.log("updateSlidePosMove : trop proche d'une slide")
//        return;
//    }

    //obligé de passer par l'index afin d'éviter //Not permitted. Untrusted code may only update documents by ID. [403]
    var slideIndex = getIndexOfSlide(slide); //pas aussi simple, il faut extraire slide.id et le chercher dans les elements de .slides

    var query = {};                 // create an empty object
    query['slides.' + slideIndex + '.displayOptions.jmpress.positions'] = {
        x: left,
        y: top,
        z: 0
    };  // and then populate the variable key

    return Slideshow.update(
            {_id: Slideshow.findOne({})._id},
    {
        $set: query
    }
    );

};


getIndexOfSlide = function(slide) {
    var allSlides = Slideshow.findOne({}).slides;
    for (var i = 0; i < allSlides.length; i++) {
        if (allSlides[i]._id === slide._id)
            return i;
    }
    return -1;
};

updateSlidePosMove = function(slide, event) {
//    return;
    var $slide = $("#" + slide._id);
    var top = parseInt($slide.css('top'));
    var left = parseInt($slide.css('left'));

    //petite verif que la slide a effectivement bougée
    if (slide.displayOptions.jmpress.positions.x == left && slide.displayOptions.jmpress.positions.y == top) {
        console.log("updateSlidePosMove : slide didn't really move");
        return;
    }


    //petite verif qu'on se superpose pas avec une slide
//    var closer = getCloserSlide(slide._id, {x: newLeft + "px", y: newTop});
//    console.log(closer.length);
//    console.log(slide._id,  newTop, newLeft, closer);
//    console.log(getCloserSlide(slide._id, {x: newTop, y: newLeft}));
//    if (closer.length != 0) {
//        console.log("updateSlidePosMove : trop proche d'une slide");
    //  return;
//    }



    //histoire de pas trop surcharger le server, on update pas tout le temps
//    var slideDb = slide;//Slides.findOne({_id: slide._id});
//    var oldTop = parseInt(slideDb.top);
//    var oldLeft = parseInt(slideDb.left);
//    //console.log("newTop",newTop,"oldTop",oldTop);
//
//    var distance = Math.sqrt(
//            Math.pow(newTop - oldTop, 2) + Math.pow(newLeft - oldLeft, 2)
//            );
//
//    //trop courte
//    if (distance < 5) {
//        console.log("skip update",distance);
//        return;
//    }

    //obligé de passer par l'index afin d'éviter //Not permitted. Untrusted code may only update documents by ID. [403]
    var slideIndex = getIndexOfSlide(slide); //pas aussi simple, il faut extraire slide.id et le chercher dans les elements de .slides

    var query = {};                 // create an empty object
    query['slides.' + slideIndex + '.displayOptions.jmpress.positions'] = {
        x: left,
        y: top,
        z: 0
    };  // and then populate the variable key

    return Slideshow.update(
            {_id: Slideshow.findOne({})._id},
    {
        $set: query
    }
    );
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
updateSlideshow = function(options) {
    if (typeof options.slide !== "undefined") {
        console.log("updateSlideshow : you cannot update slide with this function");
        return;
    }
    if (typeof options.presentationMode === "undefined") {
        console.log("updateSlideshow : presentationMode undefined");
        return;
    }

    //il n'y a qu'une presentation sur le client
    Slideshow.update(Slideshow.findOne({})._id,
            {$set: {
                    'presentationMode': options.presentationMode
                }
            });

};

removeSlidehow = function() {
    //il n'y a qu'une presentation sur le client
    Meteor.call('removeSlideshow', Slideshow.findOne({})._id, Meteor.userId(), function(error, result) {
        if (typeof error !== "undefined") {
            console.log("removeSlideshow : remove error ", error);
        } else {
            console.log("removeSlideshow : stop all corresponding subscriptions");
            //arret de la precedente si existante
            if (subscriptionSlideshow !== null)
                subscriptionSlideshow.stop();

        }
    });
//    try{

//    } catch(err){
//        console.log("deleteSlideshow : error catched ",err);
//    }
};


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