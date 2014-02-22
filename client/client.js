



/*
 * va disparaitre
 */
Meteor.subscribe("slidesLock");

subscriptionSlideshow = null;
subscriptionSlides = null;
subscriptionElements = null;
subscriptionRemote = null;

Slideshow = new Meteor.Collection("slideshow");
Slides = new Meteor.Collection("slides");
Elements = new Meteor.Collection("elements");
SlidesLock = new Meteor.Collection("slidesLock");
Remote = new Meteor.Collection("remoteSlides");


/*****
 * manage live Remote
 ****/
Meteor.startup(function() {
    //listener jquery pour la remote
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
    getSlideshowModel({title: 'testelement'});

});
/*
 * listen to change on remote
 * TODO : manage remoteMode
 */
Deps.autorun(function() {
    var remote = Remote.findOne({}); //le client n'a qu'une remote
    if (typeof remote !== "undefined") { //pour eviter une erreur la premeire fois
        var type = Session.get("clientMode");
        if (type === "jmpress") {
            console.log("follow slide !");
            $("#slideArea").jmpress("goTo", "#" + remote.activeSlideId)
        } else {
            console.log("remote slide active state changed to ", remote.activeSlideId);
            var $slide = $("#" + remote.activeSlideId);

            $(".slide.active").removeClass("active");
            $slide.addClass("active");
        }
    }
});



/******
 * events sur les templates * 
 ******/
/***
 * buttons
 ***/
Template.createSlideshow.events({
    "click input": function() {
        createSlideshowControler();
    }
});

Template.updateSlideshow.events({
    "click input": function() {
        updateSlideshowControler();
    }
});

Template.deleteSlideshow.events({
    "click input": function() {
        deleteSlideshowControler();
    }
});

Template.loadSlideshow.events({
    "click input": function() {
        getSlideshowControler();
    }
});

Template.createSlide.events({
    'click input': function() {
        var d = new Date;
        var title = d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
        createSlide({title: title, type: 'default'});
    }
});

/*
 * TODO 
 * faire une fonction pour ne (re)charger que les slides
 */
Template.loadEditor.events({
    'click input': function() {
        Session.set("clientMode", "editor");
        $("#slideArea").jmpress("deinit");
//        $('#slideArea').empty();
        getSlideshowModel({title: Slideshow.findOne().informations.title});
    }
});

/*
 * TODO : est que le setTimeout est toujours necessaire ?
 */
Template.loadJmpress.events({
    'click input': function() {
        Session.set("clientMode", "jmpress");
        //magouille parce que le callback de subscribe n'est pas un callback de Template.render (lui meme étant un callback)
        setTimeout(initJmpress, 200);

    }
});

Template.loadDeck.events({
    'click input': function() {
        Session.set("clientMode", "deck");
        //magouille parce que le callback de subscribe n'est pas un callback de Template.render (lui meme étant un callback)
        setTimeout(initDeck, 200);

    }
});

Template.addElement.events({
    'click': function(event) {
        event.stopPropagation();
        var $element = $(event.target);
        var slideId = $element.parent(".slide").attr("id");
        createSlideElement({slideId: slideId});
    }
});


/***
 * mouse action
 ***/

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

/*
 * TODO : recuperer l'id de la slide via autrement que par le DOM
 */
//update element
Template.element.events({
    'click': function(event) {
        event.stopImmediatePropagation();
        var $element = $(event.target);
        updateSlideElement($element.parent().parent(".slide").attr("id"), this);
    }
});


Template.deleteElement.events({
    'click': function(event) {
        event.stopImmediatePropagation();
        var $element = $(event.target);
        deleteSlideElement($element.parent().parent(".slide").attr("id"), this);
    }
});



/*******
 * inject data into template
 * render
 ******/
Template.slideArea.slides = function() {
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'editor') {
        console.log("slideArea empty");
        return [];
    }
    return Slides.find({});
};

Template.deckContainer.slides = function() {
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'deck') {
        console.log("deckContainer empty");
        return [];
    }
    return Slides.find({});
};

Template.elementsArea.elements = function(event) {
    return Elements.find({slideReference: {$in: [this._id]}});
};



/*
 * callback of render to add draggable and fadeInt when first render
 * TODO : refactor all with the implement of elements
 */
Template.slide.rendered = function() {
    console.log("slide.rendered", this.data._id);
    var self = this;
    var $slide = $(self.find(".slide"));
    var $slide = $("#" + this.data._id);


    var posX = this.data.displayOptions.jmpress.positions.x;
    var posY = this.data.displayOptions.jmpress.positions.y;


    var ratio = 10;


    //pos CSS (mode draggable) et jmpress       

    var type = Session.get("clientMode");
    if (type === "editor") {
        console.log("render for editor");
        $slide.draggable();
    }

    if (type === "jmpress") {
        console.log("render jmpress");
        //pas top
        $slide.css("left", 0).css("top", 0);

        $slide.attr("data-x", parseInt(posX) * ratio).attr("data-y", parseInt(posY) * ratio);


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


Template.slide.destroyed = function() {
    console.log("slide destroyed", this.data._id);
    //si un detruit une slide de jmpress, il faut l'enlever du DOM
    if (Session.get("clientMode", "jmpress")) { //je comprend pas pourquoi c'est fire à chaque fois, mais ca pose pas de probleme alors je verra plus tard
        console.log("       slide jmpress removed");
        $("#" + this.data._id).remove();
    }
};



/******
 * template method
 ******/
Template.slide.isActive = function() {
    if (Session.get("clientMode") === "jmpress")
        return "";
    var remote = Remotes.findOne({
        slideshowId: Slideshow.findOne({})._id //, activeSlideId: notnull
    });
    if (typeof remote[0] !== "undefined") { //pour eviter une erreur la premeire fois
        if (this._id === remote.activeSlideId) {
            return "active";
        } else {
            return "";
        }
    }
};

/*
 * return position according to technoSlideshow
 * @param {type} axis
 * @param {type} technoSlideshow
 * @returns {String}
 * TODO : implements Deck.js 
 */
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



/*********
 * client methods
 ********/

initDeck = function(){
    console.log("init deck");
    $.deck('.slide');    
};


initJmpress = function() {
    console.log("init jmpress");
    //launch jmpress first time
    $('#slideArea').jmpress({
        viewPort: {
            height: 400,
            width: 3200,
            maxScale: 1
        }
    });
};

createSlide = function(options) {
    console.log("create slide", options.type);
    var top = 50;
    var left = 50;
    return  Slides.insert({
        _id: Random.id(),
        informations: {
            title: options.title
        },
        slideshowReference: [Slideshow.findOne({})._id],
        elements: [],
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
    });
};

createSlideElement = function(options) {
    console.log("create element");
    var d = new Date;
    var content = "ele:" + d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();

    return Elements.insert({
        _id: Random.id(),
        slideReference: [
            options.slideId
        ],
        content: content,
        type: "text"
    });
};

/*
 * set lock is slide is free to edit
 * TODO : refactor with the implements of elements
 */
updateSlideTitleControler = function(slide) {
    var userId = Meteor.userId();
    var lock = SlidesLock.findOne({slideId: slide._id});
    if (typeof lock == 'undefined' || lock.userId == null) {
        if (typeof lock == 'undefined') {
            SlidesLock.insert({slideId: slide._id, userId: userId, type: 'title', slideTitle: slide.informations.title});
        } else {
            SlidesLock.update(
                    SlidesLock.findOne({slideId: slide._id})._id,
                    {$set: {
                            userId: userId, type: 'title', slideTitle: slide.informations.title
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
        Slides.update(slide._id, {$set:
                    {"informations.title": title}
        });
    }

    console.log("update title : remove lock of slide", slide._id);

    //supression du lock
    SlidesLock.update(
            SlidesLock.findOne({slideId: slide._id})._id,
            {$set:
                        {userId: null}
            });
};

/*
 * TODO : remettre au gout du jour le getCloserSlide
 */
updateSlidePos = function(slide, event) {
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

    //petite verif qu'on se superpose pas avec une slide
//    var closer = getCloserSlide(slide._id, {x: left + "px", y: top});
//    console.log(closer.length);
//    console.log(slide._id,  newTop, newLeft, closer);
//    console.log(getCloserSlide(slide._id, {x: newTop, y: newLeft}));
//    if (closer.length != 0) {
//        console.log("updateSlidePosMove : trop proche d'une slide")
//        return;
//    }

    return Slides.update(slide._id, {$set:
                {"displayOptions.jmpress.positions": pos}
    });
};

/*
 * TODO : remettre au gout du jour la gestion de la distance pour ne pas envoyer tout le temps l'update
 */
updateSlidePosMove = function(slide, event) {
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
    updateSlidePos(slide, event);

};

updateSlideElement = function(slideId, element) {
    console.log("update element ", element._id, " of slide ", slideId);
    var content = prompt("new title", element.content);

    if (content != null) {
        //cancel, pas d'update

        Elements.update(element._id,
                {$set:
                            {content: content}
                }
        );
    }
};

deleteSlideElement = function(slideId, element) {
    console.log("delete element ", element._id, " of slide ", slideId);
    Elements.remove(element._id);
};




setActive = function(activeSlide) {
    var remote = Remote.findOne();

    Remote.update(remote._id,
            {$set:
                        {activeSlideId: activeSlide}
            });

};


createSlideshowControler = function(callbackReturn) {
    if (typeof callbackReturn !== "undefined") { //is it the callback ?
        if (callbackReturn !== 1) {//there was an error
            alert("an error occured when creating slideshow : " + callbackReturn.reason);
        } else {
            alert("slideshow successfully created");
        }
        return;
    }

    var title = prompt("Type a title for the new slideshow");
    if (title !== null) {
        createSlideshowModel({title: title}, createSlideshowControler);
    }


};

createSlideshowModel = function(options, callback) {
    console.log("createSlideshow ", options);
    Meteor.call('createSlideshow', options, function(error, result) {
        if (typeof error !== "undefined") {
            console.log("createSlideshow : create error ", error);
            callback(error);
        } else {
            console.log("createSlideshow ", result);
            getSlideshowControler({title: options.title, presentationMode: "default"});
            callback(1);
        }
    });
};



updateSlideshowControler = function() {
    var presentationMode = Slideshow.findOne({}).presentationMode;
    presentationMode = prompt("Enter a new presentationMode for slideshow (default,hybrid) ", presentationMode);
    updateSlideshowModel({presentationMode: presentationMode});
};


updateSlideshowModel = function(options) {
    if (typeof options.presentationMode === "undefined") {
        console.log("updateSlideshow : presentationMode undefined");
        return;
    }

    Slideshow.update(Slideshow.findOne({})._id,
            {$set: {
                    'presentationMode': options.presentationMode
                }
            });
};

deleteSlideshowControler = function() {
    var title = Slideshow.findOne().informations.title;
    var answ = confirm("Do you really want to delete all slideshow " + title + " ? It will affect all users, you should'nt do that...");
    if (answ) {
        deleteSlideshowModel();
    }
};


deleteSlideshowModel = function() {
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
};


getSlideshowList = function(callback) {
    Meteor.call('getSlideshowList', {}, Meteor.userId(), function(error, result) {
        if (typeof error !== "undefined") {
            console.log("getSlideshowList : ", error);
            callback(error);
        } else {
            console.log("getSlideshowList : ", result);
            callback(result);
        }
    });
};

getSlideshowControler = function(callbackReturn) {
    if (typeof callbackReturn === "undefined") {
        getSlideshowList(getSlideshowControler);
        return;
    }
    if (typeof callbackReturn !== "undefined" && typeof callbackReturn.errorType === "undefined") { //is it the callback && is there an error 
        var title = prompt("which slideshow to load ? " + callbackReturn.titlesArray);
        getSlideshowModel({title: title});
    } else {
        console.log("getSlideshowControler : error : ", callbackReturn);
    }

};


getSlideshowModel = function(options) {
    if (Meteor.userId() === null) {
        alert("you have to be connected as a user \nlogin : user1@yopmail.com \npswd : user1user1");
        return;
    }
    
    //clean de slideArea, au cas ou
     $('#slideArea .slide').remove();
    
    console.log("getSlideshow ", options);
    Meteor.call("getSlideshow", options, Meteor.userId(), function(error, result) {
        if (typeof error !== "undefined") {
            console.log("getSlideshow : get error ", error);
        } else {
            
             
            //arret des precedentes ubscriptions si existante
            if (subscriptionSlideshow !== null)
                subscriptionSlideshow.stop();
            if (subscriptionSlides !== null)
                subscriptionSlides.stop();
            if (subscriptionElements !== null)
                subscriptionElements.stop();
            if (subscriptionRemote !== null)
                subscriptionRemote.stop();

            //nouvelles sub
            subscriptionSlideshow = Meteor.subscribe(options.title);
            subscriptionSlides = Meteor.subscribe("slides" + options.title);
            subscriptionElements = Meteor.subscribe("elements" + options.title);
            subscriptionRemote = Meteor.subscribe("remote" + options.title);

            console.log("getSlideshow ", result, ": done with subscribes");
        }
    });
};



clearServerData = function(str) {
    console.log("clearServerData");
    Meteor.call('clearServerData', function(error, result) {
        console.log("clearServerData : server answered with ", result);
    });
};

/* Exception from Deps afterFlush function: Error: Can't create second landmark in same brancj*/
/*https://github.com/meteor/meteor/issues/281#issuecomment-16191927*/
/*https://github.com/meteor/meteor/issues/281#issuecomment-28704924*/
Handlebars.registerHelper('labelBranch', function(label, options) {
    var data = this;
    return Spark.labelBranch(Spark.UNIQUE_LABEL, function() {
        return options.fn(data);
    });
});