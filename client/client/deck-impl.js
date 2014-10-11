
//  MIGRATION DONE

// Template.deckContainer.slides = function() {
// 	// logger.info("Template.deckContainer.slides");
//     if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'deck') {
//         // logger.log("deckContainer empty");
//         return [];
//     }
//     // logger.info("Template.deckContainer.slides","deckContainer inject data");
//    return Slides.find({},{sort:{order:1}});
// };



initDeck = function() {
    logger.info("initDeck");
    $.deck('.slide');
};




