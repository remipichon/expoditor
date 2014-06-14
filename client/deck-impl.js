
Template.deckContainer.slides = function() {
	console.info("Template.deckContainer.slides");
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'deck') {
        console.log("deckContainer empty");
        return [];
    }
    console.info("Template.deckContainer.slides","deckContainer inject data");
   return Slides.find({},{sort:{order:1}});
};



initDeck = function() {
    console.info("initDeck");
    $.deck('.slide');
};




