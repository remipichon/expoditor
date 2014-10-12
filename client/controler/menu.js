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
