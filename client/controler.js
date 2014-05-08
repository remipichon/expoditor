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
subscriptionRemote = null;
subscriptionLocks = null;

Slideshow = new Meteor.Collection("slideshow");
Slides = new Meteor.Collection("slides", {
    idGeneration: 'MONGO'
});
Elements = new Meteor.Collection("elements");
Locks = new Meteor.Collection("lock");
Remote = new Meteor.Collection("remoteSlides");

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
    contentMode: ['toolbar', 'modalCurrentEditing']
};

/**
 * display block mode params and hide all other block existing in the other mode
 * @param  {str} mode describe mode which mode to show
 */
displayBlockAccordingToEditorMode = function(modeToDisplay) {
    _.each(modeBlock,function(blockList,mode){
        if(modeToDisplay === mode){
            _.each(blockList,function(block){
                goog.style.showElement(goog.dom.getElement(block),true);
            });
        } else{
             _.each(blockList,function(block){
                goog.style.showElement(goog.dom.getElement(block),false);
            });
        }
    });
}


/**********************************************************
 * manage live Remote
 **********************************************************/
Meteor.startup(function() {
    //init toolbar, global pour l'init des editeurs de textes
    toolbar = setToolbar();
    var toolbarButton = initButtons();

    //affiche les block pour le slideshowMode
    displayBlockAccordingToEditorMode('slideshowMode');



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
    /*setTimeout(function() {
        $($(".editSlideContent")[0]).trigger('click');
    }, 1000);*/
});

/*
 * listen to change on remote
 * TODO : manage remoteMode
 * TODO : l'autorun ne doit recompute qu'au changement de Remote.findOne
 */
Remote.find({}).observeChanges({
    changed: function(id, fields) {
        console.log("remote changed !!")
        var remote = Remote.findOne({});

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



setActive = function(activeSlide) {
    console.log("setActive in remote", activeSlide);
    var remote = Remote.findOne();

    Remote.update(remote._id, {
        $set: {
            activeSlideId: activeSlide
        }
    });

};



/**********************************************************
 * buttons to switch between editor and presentator technos
 **********************************************************/

launchEditorControler = function() {
    //this.setEnabled(true/false)
    this.getChild('backToEditor').setEnabled(false);
    Session.set("clientMode", "editor");
}

launchJmpressControler = function() {
    truc = this;
    this.getChild('backToEditor').setEnabled(true);
    Session.set("clientMode", "jmpress");
    setTimeout(initJmpress, 200);

}

launchDeckControler = function() {
    this.getChild('backToEditor').setEnabled(true);
    Session.set("clientMode", "deck");
    setTimeout(initDeck, 200);

}
showTimelineControler = function() {
    goog.style.showElement(goog.dom.getElement("timeline"), (goog.dom.getElement('showTimeline').getAttribute("aria-pressed") === "true") ? true : false);
}

/**
 * magouille mais on s'en fout, ca va disparaitre avec le merge avec expo.remote
 */
getSlideshowControlerCaller = function() {
    getSlideshowControler();
}

initButtons = function() {
    var t2 = new goog.ui.Toolbar();
    t2.decorate(goog.dom.getElement('buttons'));

    //handler slideshow
    goog.events.listen(goog.dom.getElement('loadSlideshow'),
        goog.events.EventType.CLICK, getSlideshowControlerCaller, false, t2);
    goog.events.listen(goog.dom.getElement('createSlideshow'),
        goog.events.EventType.CLICK, createSlideshowControler, false, t2);
    goog.events.listen(goog.dom.getElement('updateSlideshow'),
        goog.events.EventType.CLICK, updateSlideshowControler, false, t2);
    goog.events.listen(goog.dom.getElement('deleteSlideshow'),
        goog.events.EventType.CLICK, deleteSlideshowControler, false, t2);

    //handler editor
    goog.events.listen(goog.dom.getElement('launchJmpress'),
        goog.events.EventType.CLICK, launchJmpressControler, false, t2);
    goog.events.listen(goog.dom.getElement('launchDeck'),
        goog.events.EventType.CLICK, launchDeckControler, false, t2);
    goog.events.listen(goog.dom.getElement('backToEditor'),
        goog.events.EventType.CLICK, launchEditorControler, false, t2);
    goog.events.listen(goog.dom.getElement('createSlide'),
        goog.events.EventType.CLICK, createSlideControler, false, t2);
    goog.events.listen(goog.dom.getElement('showTimeline'),
        goog.events.EventType.CLICK, showTimelineControler, false, t2);
    return t2;

}