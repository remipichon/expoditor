/*
 * TODO : rendre generique les selecteurs CSS pour les container
 * How to do it properly ?
 */


subscriptionSlideshow = null;
subscriptionSlides = null;
subscriptionElements = null;
subscriptionRemote = null;
subscriptionLocks = null;

Slideshow = new Meteor.Collection("slideshow");
Slides = new Meteor.Collection("slides");
Elements = new Meteor.Collection("elements");
Locks = new Meteor.Collection("lock");
Remote = new Meteor.Collection("remoteSlides");


/*****
 * manage live Remote
 ****/
Meteor.startup(function() {
    //init toolbar
    toolbar = setToolbar();


    //listener jquery pour la remote
    //keypress ne fire pas les arrow sont webkit et IE
    $(document).on("keypress", function(event) {
        var activeSlide = null;
        if (Session.get("clientMode") === "jmpress") {
            activeSlide = goog.dom.query("#jmpress-container .active").attr("id");
        } else if (Session.get("clientMode") === "deck") {
            activeSlide = goog.dom.query(".deck-container .deck-current").attr("id");
        }
        console.log("active slide : ", activeSlide);
        if (activeSlide === null)
            return;

        switch (event.keyCode) {
            case 37: // left
                setActive(activeSlide);
                break;
            case 38: // up
                setActive(activeSlide);
                break;
            case 39: // right
                setActive(activeSlide);
                break;
            case 8: // space
                setActive(activeSlide);
                break;
            case 32: // space
                setActive(activeSlide);
                break;
            case 40: // down
                setActive(activeSlide);
                break;
            default:
                return; // exit this handler for other keys
        }

    });

    console.log("init pres pour test");
    Session.set("clientMode", "editor");
    getSlideshowModel({
        title: 'test1'
    });

});

///// pooltest for editordragger
function setToolbar() {
    var quitEditButton = goog.ui.editor.ToolbarFactory
        .makeButton('quitEdit', 'Quit edit texte', 'Quit Edit', goog.getCssName('expo-toolbar-quitEdit'));

    // Specify the buttons to add to the toolbar, using built in default buttons.
    var buttons = [
        goog.editor.Command.BOLD,
        goog.editor.Command.ITALIC,
        goog.editor.Command.UNDERLINE,
        goog.editor.Command.FONT_COLOR,
        goog.editor.Command.BACKGROUND_COLOR,
        goog.editor.Command.FONT_FACE,
        goog.editor.Command.FONT_SIZE,
        goog.editor.Command.LINK,
        goog.editor.Command.UNDO,
        goog.editor.Command.REDO,
        goog.editor.Command.UNORDERED_LIST,
        goog.editor.Command.ORDERED_LIST,
        goog.editor.Command.INDENT,
        goog.editor.Command.OUTDENT,
        goog.editor.Command.JUSTIFY_LEFT,
        goog.editor.Command.JUSTIFY_CENTER,
        goog.editor.Command.JUSTIFY_RIGHT,
        goog.editor.Command.SUBSCRIPT,
        goog.editor.Command.SUPERSCRIPT,
        goog.editor.Command.STRIKE_THROUGH,
        goog.editor.Command.REMOVE_FORMAT,

        quitEditButton
    ];
    var myToolbar = goog.ui.editor.DefaultToolbar.makeToolbar(buttons,
        goog.dom.getElement('toolbar'));

    return myToolbar;



}


//editor
makeEditableCallback = function (e) {
    if (updateWithLocksControler(Elements.findOne({
        _id: this.id
    }))) {
        //cancel all other editor (if exists)
        $(".expo-toolbar-quitEdit").trigger("click");
        console.log("makeEditableCallback", this.id);
        this.makeEditable();

        var button = goog.dom.query('.expo-toolbar-quitEdit')[0];
        goog.style.setStyle(button, 'display', 'block');
    }


}

makeUneditableCallback = function (e) {
    if (this.isUneditable()) return;

    removeLocksControler(Elements.findOne({
        _id: this.id
    }));
    console.log("makeUneditableCallback", this.id);
    this.makeUneditable();

    var content = this.getCleanContents();
    updateSlideElementModel.apply(this,[content]);

    var button = goog.dom.query('.expo-toolbar-quitEdit')[0];
    goog.style.setStyle(button, 'display', 'none');
}

updateFieldContents = function(e) {
    var content = this.getCleanContents();
    console.log('content chanded : ',content);
    // updateSlideElementModel.apply(this,[content]);
}

setEditor = function(idElement) {
    if(typeof idElement === "undefined") return;
    console.log("setEditor ", idElement);
    var myField = new goog.editor.Field(idElement);
    myField.id = idElement;
    myField._id = idElement; //pour coller à miniMongo

    // Create and register all of the editing plugins you want to use.
    myField.registerPlugin(new goog.editor.plugins.BasicTextFormatter());
    myField.registerPlugin(new goog.editor.plugins.RemoveFormatting());
    myField.registerPlugin(new goog.editor.plugins.UndoRedo());
    myField.registerPlugin(new goog.editor.plugins.ListTabHandler());
    myField.registerPlugin(new goog.editor.plugins.SpacesTabHandler());
    myField.registerPlugin(new goog.editor.plugins.EnterHandler());
    myField.registerPlugin(new goog.editor.plugins.HeaderFormatter());
    myField.registerPlugin(
        new goog.editor.plugins.LoremIpsum('Click here to edit'));
    myField.registerPlugin(
        new goog.editor.plugins.LinkDialogPlugin());
    myField.registerPlugin(new goog.editor.plugins.LinkBubble());

    // Hook the toolbar into the field.
    var myToolbarController =
        new goog.ui.editor.ToolbarController(myField, toolbar);

    //send data
    goog.events.listen(myField, goog.editor.Field.EventType.DELAYEDCHANGE,
        updateFieldContents, myField);

    //manage event
    //double click pour activer l'édition de texte
    goog.events.listen(goog.dom.getElement(myField.id), goog.events.EventType.CLICK, makeEditableCallback, 'false', myField);

    // click on button to disable editor
    var button = goog.dom.query('.expo-toolbar-quitEdit')[0];
    goog.style.setStyle(button, 'display', 'none');
    goog.events.listen(goog.dom.getElement(button), goog.events.EventType.CLICK, makeUneditableCallback, 'false', myField);

    return myField;
}


/*
 * listen to change on remote
 * TODO : manage remoteMode
 * TODO : l'autorun ne doit recompute qu'au changement de Remote.findOne
 */
Remote.find({}).observeChanges({
    changed: function(id, fields) {
        console.log("remote changed !!")
        var remote = Remote.findOne({
            _id: id
        });

        if (typeof remote !== "undefined") { //pour eviter une erreur la premeire fois
            var type = Session.get("clientMode");
            if (type === "jmpress") {
                console.log("follow slide !");
                $("#jmpress-container").jmpress("goTo", "#" + remote.activeSlideId);
            } else if (type === "deck") {
                $.deck("go", remote.activeSlideId);
            } else {
                console.log("remote slide active state changed to ", remote.activeSlideId);
            }
        }
    }
});

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
        createSlide({
            title: title,
            type: 'default'
        });
    }
});

Template.loadEditor.events({
    'click input': function() {
        Session.set("clientMode", "editor");
    }
});

Template.loadJmpress.events({
    'click input': function() {
        Session.set("clientMode", "jmpress");
        setTimeout(initJmpress, 200);

    }
});

Template.loadDeck.events({
    'click input': function() {
        Session.set("clientMode", "deck");
        setTimeout(initDeck, 200);

    }
});

Template.addElement.events({
    'click': function(event) {
        event.stopPropagation();
        var $element = $(event.target);
        var slideId = $element.parent(".slide").attr("id");
        createSlideElement({
            slideId: slideId
        });
    }
});


/***
 * mouse action
 ***/

//update title
/*Template.editorSlide.events({
    'dblclick': function() {
        updateSlideTitleControler(this);
    }
});*/

//update pos on move
/*
 * TODO : reparer le mousemove
 */
/*Template.editorSlide.events({
    'mousemove': function(event) {
        return;
        if (event.which == 1) {
            updateSlidePosMove(this, event);
        }

    }
});*/

//update pos slide at the end of a move
/*Template.editorSlide.events({
    'mouseup': function(event) {
        console.log("updateSlidePos event call");
       return;
        updateSlidePos(this, event);
    }
});*/

/*Template.deleteSlide.events({
    "click": function() {
        deleteSlide(this._id);
    }
});*/


//update element
/*Template.element.events({
    'click': function(event) {
        // console.log("element : edit via prompt");
        // event.stopImmediatePropagation();
        // event.stopPropagation();
        // updateSlideElementControler(this);
        console.log("element : edit");
        // pe.DBLCLICK,makeEditableCallback,'false',  myField);

    }
});*/



/*Template.deleteElement.events({
    'mouseup': function(event) {
        event.stopImmediatePropagation();
        event.stopPropagation();
    },
    'click': function(event) {
        console.log("deleteElement ", this._id);
        event.stopImmediatePropagation();
        event.stopPropagation();
        var $element = $(event.target);
        deleteSlideElement(this);
    }
});*/



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



Template.elementsArea.elements = function() {
    return Elements.find({
        slideReference: {
            $in: [this._id]
        }
    });

};


Template.element.rendered = function() {
   setEditor(this.data._id);
}

/*
 * callback of render to add draggable when edit
 */
Template.editorSlide.rendered = function() {

    //    return;
    console.log("slide.rendered for editor", this.data._id);
    self = this;
    var $slide = $(self.find(".slide"));
    var $slide = $("#" + this.data._id);

    $slide.draggable();
};

/*
 * callback of render to move jmpress slide
 */
Template.jmpressSlide.rendered = function() {

    console.log("slide.rendered for jmpress", this.data._id);

    var posX = this.data.displayOptions.jmpress.positions.x;
    var posY = this.data.displayOptions.jmpress.positions.y;
    var ratio = 10;


    /*
     * Si jmpress est init
     * il faut mettre à jour les jmpress data de la slide jmpress (celle contenue
     * dans le #jmpress-contaner > div et l'init avec jmpress à partir de la slide
     * ajoutée par Handelbars puis supprimer le DOM de cette slide là
     */
    if ($("#jmpress-container").jmpress('initialized')) {



        var $slideToMaj = $("#jmpress-container >div #" + this.data._id);

        if ($slideToMaj.length === 0) {
            console.log("create slide ", this.data._id, " jmpress to ", posX * ratio, posY * ratio);
            var $newSlide = $("#jmpress-container > #" + this.data._id);
            $("#jmpress-container > div").append($newSlide);
            $("#jmpress-container").jmpress('init', $newSlide);
            setTimeout(function() { ///WOUW SUCH MAGIC ! 
                //je ne comprends vraiment pas pourquoi il faut un timeout qui reappend la slide...
                $("#jmpress-container > div").append($newSlide);
            }, 500);
        } else {
            console.log("update de la slide ", this.data._id, " jmpress to ", posX * ratio, posY * ratio);
            $slideToMaj.attr("data-x", parseInt(posX) * ratio).attr("data-y", parseInt(posY) * ratio);
            $("#jmpress-container").jmpress('init', $slideToMaj);
        }
        //suppression de la slide crée par Handelbars
        $("#jmpress-container >#" + this.data._id).remove();

    }



};

/*
 * A la suppression de la slide, jmpress doit deinit la slide mais il laisse
 * le dom dans le jmpress-container>div, on ajoute la classe "lymbe" pour signifier
 * que c'est une slide morte. Il faut laisser le DOM pour que le deinit du container jmpress
 * puisque fonctionner.
 *
 * Lorsqu'il ne reste plus que des slides "lymbe" et que le client n'est pas (plus) en
 * jmpress mode, il faut deinit l'ensemble du container et procéder à la suppression
 * des slides que jmpress déplace dans jmpress-container. On n'en a plus besoin ici.
 *
 * Le traitement n'est pas propre mais Jmpress fait sa petite tambouille qu'on ne peut
 * pas altérer.
 */
Template.jmpressSlide.destroyed = function() {
    console.log("slidejmpress destroyed", this.data._id);

    var slideToRemove = $("#jmpress-container >div #" + this.data._id);
    $("#jmpress-container").jmpress("deinit", slideToRemove);

    var self = this;
    setTimeout(function() {
        $("#jmpress-container #" + self.data._id).addClass("lymbe").css("display", "none");

        //       s'il n'y a plus de slide et que le client mode n'est plus jmpress, il faut deinit jmpress
        if ($("#jmpress-container >div >:not(.lymbe)").length === 0 && Session.get("clientMode") !== "jmpress") {
            console.log("jmpress-container.jmpress.deinit");
            $("#jmpress-container").jmpress("deinit"); //la slide n'existe déja plus dans le DOM, il faut un before destroyed !!!
            setTimeout(function() {
                console.log("jmpress-container.children.remove (cleaning after jmpress deinit");
                $("#jmpress-container").children().remove();
            }, 500);
        }
    }, 500);

};


/******
 *  method
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
    return Slides.insert({
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
 * set lock if component is free to edit
 */
updateWithLocksControler = function(component, field, callback) {
    if (typeof field !== "undefined" && typeof callback !== "function") {
        callback = field;
        field = null;
    }
    console.log("updateWithLocksControler");

    var lock = Locks.findOne({
        componentId: component._id
    });
    var slideshowId = Slideshow.findOne({})._id;

    if (userHasAccessToComponent(component)) {
        var userId = Meteor.userId();

        if (typeof lock == 'undefined') {
            Locks.insert({
                slideshowId: slideshowId,
                componentId: component._id,
                userId: userId,
                properties: []
            });
        } else {
            Locks.update(
                lock._id, {
                    $set: {
                        userId: userId,
                        type: 'title'
                    }
                });
        }
        console.log("update component, add lock to component", component._id);
        if (typeof callback === "function")
            callback(component);
        return true;
    } else {
        if (typeof lock !== "undefined")
            alert("lock set by " + lock.userId);
        else
            alert("you cannot edit this component");
        return false;
    }

};

removeLocksControler = function(component) {
    var lock = Locks.findOne({
        componentId: component._id
    });
    if (typeof lock === "undefined")
        return;

    //supression du lock
    Locks.update(
        lock._id, {
            $set: {
                userId: null
            }
        });
};

updateSlideTitleControler = function(slide) {
    updateWithLocksControler(slide, "title", updateSlideTitleModel);
};

updateSlideTitleModel = function(slide) {
    console.log("update title, model");
    var title = prompt("new title", slide.informations.title);

    if (title != null) {
        Slides.update(slide._id, {
            $set: {
                "informations.title": title
            }
        });
    }

    console.log("update title : remove lock of slide", slide._id);
    removeLocksControler(slide);

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

    return Slides.update(slide._id, {
        $set: {
            "displayOptions.jmpress.positions": pos
        }
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

updateSlideElementControler = function(element) {
    updateWithLocksControler(element, updateSlideElementModel);
};


updateSlideElementModel = function(content) {
    console.log("update element model");

    Elements.update(this._id, {
        $set: {
            content: content
        }
    });


    removeLocksControler(this);
};

deleteSlideElement = function(element) {
    console.log("delete element ", element._id);
    Elements.remove(element._id);
};



setActive = function(activeSlide) {
    console.log("setActive in remote", activeSlide);
    var remote = Remote.findOne();

    Remote.update(remote._id, {
        $set: {
            activeSlideId: activeSlide
        }
    });

};


createSlideshowControler = function(callbackReturn) {
    if (typeof callbackReturn !== "undefined") { //is it the callback ?
        if (callbackReturn !== 1) { //there was an error
            alert("an error occured when creating slideshow : " + callbackReturn.reason);
        } else {
            alert("slideshow successfully created");
        }
        return;
    }

    var title = prompt("Type a title for the new slideshow");
    if (title !== null) {
        createSlideshowModel({
            title: title
        }, createSlideshowControler);
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
            getSlideshowModel({
                title: options.title,
                presentationMode: "default"
            });
            callback(1);
        }
    });
};



updateSlideshowControler = function() {
    var presentationMode = Slideshow.findOne({}).presentationMode;
    presentationMode = prompt("Enter a new presentationMode for slideshow (default,hybrid) ", presentationMode);
    updateSlideshowModel({
        presentationMode: presentationMode
    });
};


updateSlideshowModel = function(options) {
    if (typeof options.presentationMode === "undefined") {
        console.log("updateSlideshow : presentationMode undefined");
        return;
    }

    Slideshow.update(Slideshow.findOne({})._id, {
        $set: {
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
        if (callbackReturn.titlesArray.length == 0) {
            alert("There is no slideshow to load, create a slideshow to start");
            return;
        }
        var title = prompt("which slideshow to load ? " + callbackReturn.titlesArray);
        getSlideshowModel({
            title: title
        });
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
    //    $('#slideArea .slide').remove();

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
            if (subscriptionLocks !== null)
                subscriptionLocks.stop();

            //nouvelles sub
            subscriptionSlideshow = Meteor.subscribe(options.title);
            subscriptionSlides = Meteor.subscribe("slides" + options.title);
            subscriptionElements = Meteor.subscribe("elements" + options.title);
            subscriptionRemote = Meteor.subscribe("remote" + options.title);
            subscriptionRemote = Meteor.subscribe("locks" + options.title);

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