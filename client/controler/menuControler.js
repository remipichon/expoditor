//id of block displayed according to editor mode
modeBlock = {
    slideshowMode: ['timeline', 'buttons', 'editor-container'],
    contentMode: ['toolbar', 'modalCurrentEditing'],
};

//id of button not enabled when there is no slideshow
buttonWhenSlideshow = ['createSlide', 'launchSlideshow', 'updateSlideshow', 'deleteSlideshow'];


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


quitEditSlide = function() {
    logger.info("quitEditSlide");
    //cancel all remaining editor (if exists)
    $(".expo-toolbar-quitEdit-texte").trigger("click"); //TODO fire event perso

    Session.set("modalCurrentEditing", false);
    CurrentEditing.remove({});

    displayBlockAccordingToEditorMode("slideshowMode");
}



_initButtons = function() {
    logger.info("initButtons");
    var buttons = new goog.ui.Toolbar();
    buttons.decorate(goog.dom.getElement('buttons'));

    logger.info("initButtons handler slideshow");
    //handler slideshow
    goog.events.listen(goog.dom.getElement('loadSlideshow'),
        goog.events.EventType.CLICK, _slideshowGetCaller, false, buttons);
    goog.events.listen(goog.dom.getElement('createSlideshow'),
        goog.events.EventType.CLICK, slideshowControler.create, false, buttons);
    goog.events.listen(goog.dom.getElement('updateSlideshow'),
        goog.events.EventType.CLICK, slideshowControler.update, false, buttons);
    goog.events.listen(goog.dom.getElement('deleteSlideshow'),
        goog.events.EventType.CLICK, slideshowControler.delete, false, buttons);

    logger.info("initButtons handler editor");
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
        goog.events.EventType.CLICK, slideControler.create, false, buttons);
    goog.events.listen(goog.dom.getElement('showTimeline'),
        goog.events.EventType.CLICK, showTimelineControler, false, buttons);

    //disable button while there is no slideshow
    _.each(buttonWhenSlideshow, function(id) {
        buttons.getChild(id).setEnabled(false);
    });
    return buttons;

}

_slideshowGetCaller = function(event) {
    slideshowControler.get(event);
}

_setToolbar = function() {
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
    goog.events.listen(goog.dom.getElement("addElementTextButton"), goog.events.EventType.CLICK,
        elementControler.addTexte);


    var button = goog.dom.getElement('quitEditTexteButton');
    goog.style.setOpacity(button, '0');

    return myToolbar;
}