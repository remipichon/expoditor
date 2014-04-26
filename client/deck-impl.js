
Template.deckContainer.slides = function() {
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'deck') {
        console.log("deckContainer empty");
        return [];
    }
    console.log("deckContainer inject data");
    return Slides.find({});
};



initDeck = function() {
    console.log("init deck");
    $.deck('.slide');
};




