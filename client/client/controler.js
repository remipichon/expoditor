/**
 * Remote controler
 *
 * binding button to switch between technos
 */


/**
 * controler.js
 * RemiP
 */



/**********************************************************
 * init global var and Session
 **********************************************************/


subscriptionSlideshow = null;
subscriptionSlides = null;
subscriptionElements = null;
// subscriptionRemote = null;
subscriptionLocks = null;

Slideshow = new Meteor.Collection("slideshow");
Slides = new Meteor.Collection("slides", {
    idGeneration: 'MONGO'
});
Elements = new Meteor.Collection("elements");
Locks = new Meteor.Collection("lock");

//slide en cours d'édition
CurrentEditing = new Meteor.Collection('currentEditing', {
    connection: null
});

//pour conversion editor vers jmpress
ratio = 5;

//reinit des variables de sessions
Session.set('modalCurrentEditing', false);
Session.set("heavyRefresh", false); //false to update positions and content less frequently

//id of block displayed according to editor mode
modeBlock = {
    slideshowMode: ['timeline', 'buttons', 'editor-container'],
    contentMode: ['toolbar', 'modalCurrentEditing'],
};

//id of button not enabled when there is no slideshow
buttonWhenSlideshow = ['createSlide', 'launchSlideshow', 'updateSlideshow', 'deleteSlideshow'];

toolbarButton = null;

/**
 * display block mode params and hide all other block existing in the other mode
 * @param  {str} mode describe mode which mode to show
 */
displayBlockAccordingToEditorMode = function(modeToDisplay) {
    logger.info("displayBlockAccordingToEditorMode", modeToDisplay)
    _.each(modeBlock, function(blockList, mode) {
        if (modeToDisplay === mode) {
            _.each(blockList, function(block) {
                goog.style.showElement(goog.dom.getElement(block), true);
            });
        } else {
            _.each(blockList, function(block) {
                goog.style.showElement(goog.dom.getElement(block), false);
            });
        }
    });
}

disableLog = function() {
    logger.log("disableLog");
    logger.info("disableLog");
    logger.debug("disableLog");

    logger.log2 = logger.log;
    logger.log = function() {};
    logger.debug2 = logger.debug;
    logger.debug = function() {};
    logger.info2 = logger.info;
    logger.info = function() {};
}
enableLog = function() {
    logger.log = logger.log2;
    logger.log2 = function() {};
    logger.debug = logger.debug2;
    logger.debug2 = function() {};
    logger.info = logger.info2;
    logger.info2 = function() {};

    logger.log("enableLog");
    logger.info("enableLog");
    logger.debug("enableLog");

}

/**********************************************************
 * manage live Remote
 **********************************************************/
Meteor.startup(function() {

    logger = log.noConflict();
    logger.setLevel("trace");
    logger.log = function() {
        var args = Array.prototype.slice.call(arguments);
        console.log.apply(console, args);
    }
 
    

    logger.debug("logger init");

    Hooks.init();
    // disableLog();
    //init toolbar, global pour l'init des editeurs de textes
    toolbar = setToolbar();
    toolbarButton = initButtons();

    //affiche les block pour le slideshowMode
    displayBlockAccordingToEditorMode('slideshowMode');


    /*
    //listener jquery pour la remote
    //keypress ne fire pas les arrow sont webkit et IE
    $(document).on("keypress", function(event) {
        //setTimeline();

        var activeSlide = null;
        if (Session.get("clientMode") === "jmpress") {
            activeSlide = $("#jmpress-container .active").attr("id");
        } else if (Session.get("clientMode") === "deck") {
            activeSlide = $(".deck-container .deck-current").attr("id");
        }
        logger.log("active slide : ", activeSlide);
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
*/
    logger.log("init pres pour test");
    Session.set("clientMode", "editor");
    getSlideshowModel({
        title: 'test'
    });
    /*setTimeout(function() {
        $($(".editSlideContent")[0]).trigger('click');
    }, 1000);*/

    //add texte with dbl blick
    goog.events.listen(goog.dom.getElement('modalCurrentEditing'), goog.events.EventType.DBLCLICK, addElementTexte)
    goog.events.listen(goog.dom.getElement('editor-container'), goog.events.EventType.DBLCLICK, addSlide)
    //edit slideshowTitle
    goog.events.listen(goog.dom.getElement('slideshowTitle'), goog.events.EventType.DBLCLICK, updateSlideshowControler);

});

addElementTexte = function(event) {
    logger.info("addElementTexte", event.offsetY, event.offsetX);
    if (event.target.className !== "elementsAreaCurrentEditing") {
        logger.warn("addElementTexte : magouille pour prevent le dblclick on element to create element");
        return;
    }

    createElementTexte({
        pos: {
            y: event.offsetY * ratioContentMode,
            x: event.offsetX * ratioContentMode
        }
    });

}

addSlide = function(event) {
    logger.info("addSlide", event.offsetY, event.offsetX)
    createSlide({
        pos: {
            y: event.offsetY * ratioSlideshowMode,
            x: event.offsetX * ratioSlideshowMode
        }
    });

}

/*
 * listen to change on remote
 * ==> projet de ClaireZed
 */
/*Remote.find({}).observeChanges({
    changed: function(id, fields) {
        logger.info("Remote.find({}).observeChanges.changed");
        var remote = Remote.findOne({});
        if (typeof remote !== "undefined") { //pour eviter une erreur la premeire fois
            logger.info("Remote.find({}).observeChanges.changed", "follow slide", remote.activeSlideId);
            var type = Session.get("clientMode");
            if (type === "jmpress") {
                $("#jmpress-container").jmpress("goTo", "#" + remote.activeSlideId);
            } else if (type === "deck") {
                $.deck("go", remote.activeSlideId);
            } else {

            }
        }
    }
});*/



/*setActive = function(activeSlide) {
    logger.info("setActive in remote", activeSlide);
    var remote = Remote.findOne();

    Remote.update(remote._id, {
        $set: {
            activeSlideId: activeSlide
        }
    });

};*/



/**********************************************************
 * buttons to switch between editor and presentator technos
 **********************************************************/

launchEditorControler = function() {
    logger.info("launchEditorControler");
    this.getChild('backToEditor').setEnabled(false);
    Session.set("clientMode", "editor");
}

launchJmpressControler = function() {
    logger.info("launchJmpressControler");
    this.getChild('backToEditor').setEnabled(true);

    Session.set("clientMode", "jmpress");
    setTimeout(initJmpress, 200);

}

launchDeckControler = function() {
    logger.info("launchDeckControler");
    this.getChild('backToEditor').setEnabled(true);
    Session.set("clientMode", "deck");
    setTimeout(initDeck, 200);
}

launchTurnControler = function() {
    logger.info("launchTurnControler");
    this.getChild('backToEditor').setEnabled(true);
    Session.set("clientMode", "turn");
    setTimeout(initTurn, 1500);
    // initDeck();
    // setTimeout(function(){
    //     Session.set("clientMode", "turn");
    // },500); //TODO : is it really necessary ?

}

showTimelineControler = function() {
    logger.info("showTimelineControler");
    goog.style.showElement(goog.dom.getElement("timeline"), (goog.dom.getElement('showTimeline').getAttribute("aria-pressed") === "true") ? true : false);
}

/**
 * magouille mais on s'en fout, ca va disparaitre avec le merge avec expo.remote
 */
getSlideshowControlerCaller = function() {
    logger.info("getSlideshowControlerCaller");
    getSlideshowControler();
}

initButtons = function() {
    logger.info("initButtons");
    var buttons = new goog.ui.Toolbar();
    buttons.decorate(goog.dom.getElement('buttons'));

    //handler slideshow
    goog.events.listen(goog.dom.getElement('loadSlideshow'),
        goog.events.EventType.CLICK, getSlideshowControlerCaller, false, buttons);
    goog.events.listen(goog.dom.getElement('createSlideshow'),
        goog.events.EventType.CLICK, createSlideshowControler, false, buttons);
    goog.events.listen(goog.dom.getElement('updateSlideshow'),
        goog.events.EventType.CLICK, updateSlideshowControler, false, buttons);
    goog.events.listen(goog.dom.getElement('deleteSlideshow'),
        goog.events.EventType.CLICK, deleteSlideshowControler, false, buttons);

    //handler editor
    goog.events.listen(goog.dom.getElement('launchJmpress'),
        goog.events.EventType.CLICK, launchJmpressControler, false, buttons);
    goog.events.listen(goog.dom.getElement('launchDeck'),
        goog.events.EventType.CLICK, launchDeckControler, false, buttons);
    goog.events.listen(goog.dom.getElement('launchTurn'),
        goog.events.EventType.CLICK, launchTurnControler, false, buttons);
    goog.events.listen(goog.dom.getElement('backToEditor'),
        goog.events.EventType.CLICK, launchEditorControler, false, buttons);
    goog.events.listen(goog.dom.getElement('createSlide'),
        goog.events.EventType.CLICK, createSlideControler, false, buttons);
    goog.events.listen(goog.dom.getElement('showTimeline'),
        goog.events.EventType.CLICK, showTimelineControler, false, buttons);

    //disable button while there is no slideshow
    _.each(buttonWhenSlideshow, function(id) {
        buttons.getChild(id).setEnabled(false);
    });
    return buttons;

}

setToolbar = function() {
    logger.info("setToolbar");
    // if(typeof toolbar !== 'undefined'){
    //     throw new Meteor.Error("500","A toolbar is alredy set",toolbar);
    // }

    var quitEditTexteButton = goog.ui.editor.ToolbarFactory
        .makeButton('quitEditTexteButton', 'Quit edit texte', 'Quit Edit Texte', goog.getCssName('expo-toolbar-quitEdit-texte'));
    var quitEditSlideButton = goog.ui.editor.ToolbarFactory
        .makeButton('quitEditSlideButton', 'Quit edit slide', 'Quit Edit Slide', goog.getCssName('expo-toolbar-quitEdit-slide'));
    var addElementTextButton = goog.ui.editor.ToolbarFactory
        .makeButton('addElementTextButton', 'Add texte field', 'Add tex field', goog.getCssName('expo-toolbar-add-element'));



    // Specify the buttons to add to the using, toolbar built in default buttons.
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

        quitEditSlideButton,
        quitEditTexteButton, //WARNING : ne pas enlever ou alors le mettre en hidden. Tous les editor bind ce button pour etre désactivé et certain traitement trigger
        //ce button pour s'arrurer qu'il ne reste aucuns texte editable (quitEditSlide notamment)
        addElementTextButton
    ];
    var myToolbar = goog.ui.editor.DefaultToolbar.makeToolbar(buttons,
        goog.dom.getElement('toolbar'));

    goog.events.listen(goog.dom.getElement("quitEditSlideButton"), goog.events.EventType.CLICK, quitEditSlide);
    goog.events.listen(goog.dom.getElement("addElementTextButton"), goog.events.EventType.CLICK, createElementTexte);


    var button = goog.dom.getElement('quitEditTexteButton');
    goog.style.setOpacity(button, '0');

    return myToolbar;
}


quitEditSlide = function() {
    logger.info("quitEditSlide");
    //cancel all remaining editor (if exists)
    $(".expo-toolbar-quitEdit-texte").trigger("click"); //TODO fire event perso

    Session.set("modalCurrentEditing", false);
    CurrentEditing.remove({});

    displayBlockAccordingToEditorMode("slideshowMode");
}