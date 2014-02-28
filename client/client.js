

/*
 * TODO : rendre generique le selecteur CSS pour les container
 */

/*
 * utiliser les event de jquery à la place du maps event de Meteor :
 * il est foireux et a un comportement que je capte pas
 */

/*
 * jmpress pose soucis, les données ne sont pas réinjecter dans le container la deuxieme fois  
 */

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
Lock = new Meteor.Collection("slidesLock");
Remote = new Meteor.Collection("remoteSlides");


/*****
 * manage live Remote
 ****/
Meteor.startup(function() {
    //listener jquery pour la remote
    //keypress ne fire pas les arrow sont webkit et IE
    $(document).on("keypress", function(event) {
        if (Session.get("clientMode") === "jmpress") {
            var activeSlide = $("#jmpress-container .active").attr("id");
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
 * TODO : deleguer la gestion de la class active à Handelbars via le helper isActive
 */
//Deps.autorun(function() {
//    var remote = Remote.findOne({}); //le client n'a qu'une remote
//    if (typeof remote !== "undefined") { //pour eviter une erreur la premeire fois
//        var type = Session.get("clientMode");
//        if (type === "jmpress") {
//            console.log("follow slide !");
//            $("#jmpress-container").jmpress("goTo", "#" + remote.activeSlideId);
//        } else if (type === "deck") {
//            $.deck("go", remote.activeSlideId);
//        } else {
//            console.log("remote slide active state changed to ", remote.activeSlideId);
//        }
//    }
//});



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

        $("#jmpress-container").jmpress("deinit");
        setTimeout(function() {
            $('#jmpress-container').empty();
            Session.set("clientMode", "editor");
        }, 200); //pour attendre que jmpress est fini son boulot
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
Template.editorSlide.events({
    'dblclick': function() {
        updateWithLockControler(this, updateSlideTitleModel);
    }
});

//update pos on move
Template.editorSlide.events({
    'mousemove': function(event) {
        return;
        if (event.which == 1) {
            updateSlidePosMove(this, event);
        }

    }
});

//update pos slide at the end of a move
Template.editorSlide.events({
    'mouseup': function(event) {
        console.log("updateSlidePos event call");
//        return;
        updateSlidePos(this, event);
    }
});

Template.deleteSlide.events({
    "click": function() {
        deleteSlide(this._id);
    }
});

/*
 * TODO : recuperer l'id de la slide via autrement que par le DOM
 */
//update element
Template.element.events({
    'dblclick': function(event) {
        console.log("element : edit via prompt");
//        event.stopImmediatePropagation();
        var $element = $(event.target);
        updateSlideElement(this);

//        //TODO
//        //l'injection des données dans élements contient
//        //tout sauf les elements sur lequel le user a un lock
//        $element.on("keyup.editElement", function() {
//            console.log("keyup element");
//           
//            Elements.update($(this).attr("id"),
//                    {$set:
//                                {content: $(this).html()}
//                    }
//            );
//
//        });
//        $element.on("mousemove", function() {
//            $element.off("editElement");
//        });
    },
    'mousedown': function(event) {
        event.stopPropagation();
        console.log("element mousedown");
        updateWithLockControler(this);
    },
    'keyup': function(event) {
        if (!userHasAccessToComponent(this)) {
            console.log("element : keyup : user cannot edit texte");
            return;
        }
//        event.stopImmediatePropagation();
        console.log("element : keyup edit texte : ", $(event.target).html());
//        event.stopImmediatePropagation();
        var $element = $(event.target);

        Elements.update($(event.target).attr("id"),
                {$set:
                            {content: $(event.target).html()}
                }
        );
    },
    'mouseleave': function(event) {
        console.log("element : mouseleave : DESACTIVER WARNING");
//        event.stopImmediatePropagation();
        removeLockControler(this);
    }
});

//$('.element p').on('keypress', function(event) {
////        if (!userHasAccessToComponent(this)) {
////            console.log("element : keyup : user cannot edit texte");
////            return;
////        }
//        event.stopImmediatePropagation();
//        console.log("element : keyup edit texte : ", $(event.target).html());
//        event.stopImmediatePropagation();
//        var $element = $(event.target);
//
//        Elements.update($(event.target).attr("id"),
//                {$set:
//                            {content: $(event.target).html()}
//                }
//        );
//    });


Template.deleteElement.events({
//    'mouseenter': function(event){
//        console.log("mouseenter deleteelement");
//    },
    'click': function(event) {
        console.log("deleteElement ",this._id);
//        event.stopImmediatePropagation();
        var $element = $(event.target);
        deleteSlideElement($element.parent().parent(".slide").attr("id"), this);
    }
});



/*******
 * inject data into template
 * render
 ******/
Template.editorContainer.slides = function() {
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'editor') {
        console.log("editorContainer empty");
        return [];
    }
    console.log("editorContainer inject data");
    return Slides.find({});
};

Template.jmpressContainer.slides = function() {
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'jmpress') {
        console.log("jmpressContainer empty");
        return [];
    }
    console.log("jmpressContainer inject data");
    return Slides.find({});
};

Template.deckContainer.slides = function() {
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'deck') {
        console.log("deckContainer empty");
        return [];
    }
    console.log("deckContainer inject data");
    return Slides.find({});
};



/*
 * 
 * tenttative pour preserver l'element texte en cours d'édition
 *
 * https://groups.google.com/forum/#!msg/meteor-talk/Qg-zfoTVwrg/bRTc1Tv7r1wJ
 *
 */

Template.element.preserve({
   'p': function(node){
       return node.id;
   } 
});

/*
 * les elements en cours d'uptate chez un client sont en constant chez ce meme client
 *
 **/
 //////NOT USED
Template.elementsArea.elementsNotUpdated = function() {
   return [];
        var forbiddenElement = Lock.findOne(
            {userId: {
//                    $not: 
//                            Meteor.userId()
                            
//                          {
                        $in: [
                            Meteor.userId()
                        ]
//                    }

                }
            });
            
            
      if (typeof forbiddenElement !== "undefined") {
//        console.log("elementsArea.elements : there is an element locked", forbiddenElement.componentId, this._id);
        return Elements.find({$and: [{_id: {$in: [forbiddenElement.componentId]}}, {slideReference: {$in: [this._id]}}]}).fetch();
    } else {
//        console.log("elementsArea.elements : no element locked")
        return [];//Elements.find({slideReference: {$in: [this._id]}});
    }    
};


Template.elementsArea.elements = function() {
//    var forbiddenElement = Lock.findOne({userId: Meteor.userId()}); //en admettant que le user n'ait qu'un seul lock à la fois
//
//get element lockedByuser in order to l'afficher en mode constant
    var forbiddenElement = Lock.findOne(
            {userId: {
//                    $not: 
//                            Meteor.userId()
                            
//                          {
                        $in: [
                            Meteor.userId()
                        ]
//                    }

                }
            });
            
            
//    //get elementLocked si ce n'est pas le user qui l'a lock
//    var forbiddenElement = Lock.findOne(
//            {userId: {
////                    $not: 
////                            Meteor.userId()
//                            
////                          {
//                        $nin: [
//                            null, Meteor.userId()
//                        ]
////                    }
//
//                }
//            });



//             {$ne: {userId: {$or: [null]} }}); //en admettant que le user n'ait qu'un seul lock à la fois

    if (false){//typeof forbiddenElement !== "undefined") {
        console.log("elementsArea.elements : there is an element locked", forbiddenElement.componentId, this._id);
        return Elements.find({$and: [{_id: {$nin: [forbiddenElement.componentId]}}, {slideReference: {$in: [this._id]}}]}).fetch();
    } else {
        console.log("elementsArea.elements : no element locked")
        return Elements.find({slideReference: {$in: [this._id]}});
    }
};



/*
 * callback of render to add draggable when edit
 */
Template.editorSlide.rendered = function() {
//    return;
    console.log("slide.rendered for editor", this.data._id);
    var self = this;
    var $slide = $(self.find(".slide"));
    var $slide = $("#" + this.data._id);

    $slide.draggable();
};

/*
 * callback of render to move jmpress slide
 */
Template.jmpressSlide.rendered = function() {
//    return;
    console.log("slide.rendered for jmpress", this.data._id);
    var self = this;
    var $slide = $(self.find(".slide"));
    var $slide = $("#" + this.data._id);


    var posX = this.data.displayOptions.jmpress.positions.x;
    var posY = this.data.displayOptions.jmpress.positions.y;
    var ratio = 10;

    $slide.attr("data-x", parseInt(posX) * ratio).attr("data-y", parseInt(posY) * ratio);


    //lors de l'abonnement, on crée toutes les slides d'un coup puis jmpress passe par là.
    //donc on ne reinit les slides qu'au rerender (je crois qu'il y a un astuce meteor pour m'eviter de faire ca)
    if ($("#jmpress-container").jmpress('initialized')) {

        //encore une magouille. Si #slideArea a plus d'un fils c'est que $slide en est un, il faut donc la deplacer dans le div container de camera jmpress
        if ($("#jmpress-container >").length != 1) {
            $("#jmpress-container div:not(.slide)").append($slide);
        }

        console.log("init de la slide");
        //deplacement de slide
//            $("#jmpress-container >").append($slide);
        $("#jmpress-container").jmpress('init', $slide);
    }



};


Template.jmpressSlide.destroyed = function() {
//    return;                                                     //DEBUG BUG LOAD JMPRESS
    console.log("slidejmpress destroyed", this.data._id);
    $("#" + this.data._id).remove();

};



/******
 * template method
 ******/
Template.editorSlide.isActive = function() {

    var remote = Remote.findOne({
        slideshowId: Slideshow.findOne({})._id //, activeSlideId: notnull
    });
    if (typeof remote !== "undefined") { //pour eviter une erreur la premeire fois
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
Template.jmpressSlide.getJmpressData = function(axis) {

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

};

Template.editorSlide.getEditorData = function(axis) { //pas encore utilisé à cause du draggable de jqueryreu
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


/**************
 * modal 
 *************/
Template.modalTemplate.isVisible = function() {
    if (Session.get("modalSelectSlideshow")) {
        return true;
    } else {
        return false;
    }
};

//Template.modalTemplate.title = function(){
//  return "Choose a slideshow to load";
//};

//Meteor.render(function() {
//    return Template.modalTemplate(
//            {data:
//                        ["title1", "title2", "title3"]
//            }
//    );
//});

//Template.modalTemplate.data = function(){
//  return "Choose a slideshow to load";
//};

Template.listSlideshow.slideshowList = function() {
    return ["title1", "title2", "title3"];
    return getSlideshowList();
};




/*********
 * client methods
 ********/

initDeck = function() {
    console.log("init deck");
    $.deck('.slide');
};


initJmpress = function() {
    console.log("init jmpress");
    //launch jmpress first time
    $('#jmpress-container').jmpress({
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

deleteSlide = function(slideId) {
    console.log("delete slide : ", slideId);
    Slides.remove(slideId);
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
 * TODO
 * bha, à faire en fait
 */
userHasAccessToComponent = function(component) {
    console.log("userHasAccessToComponent : TODO !");
    return true;
};

/*
 * set lock if slide/element is free to edit
 */
updateWithLockControler = function(component, callback) {
    var userId = Meteor.userId();
    var lock = Lock.findOne({componentId: component._id});
    if (typeof lock == 'undefined' || lock.userId == null) {
        if (typeof lock == 'undefined') {
            Lock.insert({componentId: component._id, userId: userId});
        } else {
            Lock.update(
                    Lock.findOne({componentId: component._id})._id,
                    {$set: {
                            userId: userId, type: 'title'
                        }});
        }
        console.log("update component, add lock to component", component._id);
        if (typeof callback !== "undefined")
            callback(component);
        return true;
    } else {
        alert("lock set by " + lock.userId);
        return false;
    }

};

removeLockControler = function(component) {
    var lock = Lock.findOne({componentId: component._id});
    if (typeof lock === "undefined")
        return;

    //supression du lock
    Lock.update(
            lock._id,
            {$set:
                        {userId: null}
            });
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
    removeLockControler(slide);

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
    return;
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

updateSlideElement = function(element) {
    console.log("update element ", element._id);
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
    console.log("setActive in remote", activeSlide);
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

printResult = function(result) {
    console.log(result);
    return result;
};

getSlideshowList = function(callback) {
    if (typeof callback === "undefined")
        callback = printResult;

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

getSlideshowList2 = function() {
    var list;
    Meteor.call('getSlideshowList', {}, Meteor.userId(), function(error, result) {
        if (typeof error !== "undefined") {
            console.log("getSlideshowList : ", error);
            list = ["error"];
        } else {
            console.log("getSlideshowList : ", result);
            list = result;
        }
    });
    return list;
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