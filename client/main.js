/**********************************************************
 * init global var and Session
 **********************************************************/


subscriptionSlideshow = null;
subscriptionSlides = null;
subscriptionElements = null;
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
    timelineControler = new TimelineControler("timeline");
    slideControler = new SlideControler();
    slideControler.instanceName = "slideControler";
    slideshowControler = new SlideshowControler();
    slideshowControler.instanceName = "slideshowControler";


	//INJECT SERVICES
	googEditor = new GoogEditor();
	googDragger = new GoogDragger();
	resizeService = new ResizeService();

    //HELPER
    serverBackendDAO = new ServerBackendDAO();



    Hooks.init();

    //init toolbar, global pour l'init des editeurs de textes
    toolbar = _setToolbar();
    toolbarButton = _initButtons();

    //affiche les block pour le slideshowMode
    displayBlockAccordingToEditorMode('slideshowMode');


    //add texte with dbl blick
    goog.events.listen(goog.dom.getElement('modalCurrentEditing'), goog.events.EventType.DBLCLICK, 
        elementControler.addTexte)
    goog.events.listen(goog.dom.getElement('editor-container'), goog.events.EventType.DBLCLICK,
     slideControler.create)
    //edit slideshowTitle
    goog.events.listen(goog.dom.getElement('slideshowTitle'), goog.events.EventType.DBLCLICK, slideshowControler.update);

});


