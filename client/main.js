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


Meteor.startup(function() {

	//SETUP LOGGER
    logger = log.noConflict();
    logger.setLevel("trace");
    logger.log = function() {
        var args = Array.prototype.slice.call(arguments);
        //console.log.apply(console, args);
    }

    logger.debug("logger init");


    //INJECT CONTROLER
	elementControler = new ElementControler();
    elementControler.instanceName = "elementControler"; 

	//INJECT SERVICES
	googEditor = new GoogEditor();
	googDragger = new GoogDragger();
	resizeService = new ResizeService();




    Hooks.init();

    //init toolbar, global pour l'init des editeurs de textes
    toolbar = _setToolbar();
    toolbarButton = _initButtons();

    //affiche les block pour le slideshowMode
    displayBlockAccordingToEditorMode('slideshowMode');


    logger.log("init pres pour test");
    Session.set("clientMode", "editor");
    getSlideshowModel({
        title: 'test'
    });
   

    //add texte with dbl blick
    goog.events.listen(goog.dom.getElement('modalCurrentEditing'), goog.events.EventType.DBLCLICK, 
        elementControler.addTexte)
    goog.events.listen(goog.dom.getElement('editor-container'), goog.events.EventType.DBLCLICK, addSlide)
    //edit slideshowTitle
    goog.events.listen(goog.dom.getElement('slideshowTitle'), goog.events.EventType.DBLCLICK, updateSlideshowControler);

});





_initButtons = function() {
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