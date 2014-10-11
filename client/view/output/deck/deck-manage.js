DeckManager = function(){};


DeckManager.prototype.initDeck = function() {
    $.deck('.slide');
};




Template.deckContainer.slides = function() {
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'deck') {
        return [];
    }
    logger.info("Template.deckContainer.slides","deckContainer inject data");
   return Slides.find({},{sort:{order:1}});
};

