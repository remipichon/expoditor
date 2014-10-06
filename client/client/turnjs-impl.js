
turnIsInit = false; //vairable globale degeullasse



Template.turnContainer.slides = function() {
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'turn') {
        turnIsInit = false;
        // logger.info("Template.turnContainer.slides  empty");
        if($("#turn-container").length !== 0){
                $("#turn-container").turn("destroy");
            }
        $("#turn-container >").remove();
         $("#turn-container").css("position","relative");
        return [];
    }

       
    $("#turn-container").append('<div class="cover"><h1>The Bible</h1></div>');
    // logger.log("Template.turnContainer.slides  inject data");
    return Slides.find({}, {
        sort: {
            order: 1
        },
        reactive: false
    });
};



initTurn = function() {
    logger.info("initTurn");

    $("#turn-container").turn({
        acceleration: true, //for mobile use
        pages: 10, //TODO est ce necessaire ?
        elevation: 100, //elevation de la page pendant la transition
        gradients: true, //!$.isTouch,

    });
    turnIsInit = true;

}


function createTurnPage(_id) {
    logger.debug("createTurnPage",_id);
    var newPage = UI.renderWithData(Template.turnSlide, Slides.findOne({
        _id: _id
    }));

    //newPage = $('<div />', {'class': 'page '+((_id%2==0) ? 'odd' : 'even'), 'id': 'page-'+_id}).html('<i class="">page '+_id+'</i>');
    $("#turn-container").turn('addPage', newPage, newPage.order);
}

function deleteTurnPage(_id) {
    logger.debug("deleteTurnPage",_id);    
    var page = Slides.findOne({_id:_id});
    var order = page.order;
    logger.debug("deleteTurnPage",page,order);
    $("#turn-container").turn("removePage", order);
}



//TODO see what appends when there is several identical observeChanges
Slides.find({}).observeChanges({
    added: function(_id, slide) {
        if (Session.get("clientMode") === "turn") {
            logger.debug("Slides.find({}).observeChanges.added.turn",_id);
            //required : get techno status : is init ?
           if (turnIsInit) {
                logger.debug("slides.obsverchanges.added.turn.isInit", _id);
                createTurnPage(_id);
            }



        }
    },
    changed: function(_id, fields) {
        return;
        if (Session.get("clientMode") === "turn") {
            if (typeof fields.order === "undefined") {
                return;
            }


            var activeSlideId = $("#turn-container >div .active").attr("id");
            logger.debug("slides.obsverchanges.changed.turn", _id, "activeslideId", activeSlideId, "fields", fields);


            if (activeSlideId === _id) {
                logger.debug("shit, someone move the where you are and this broke turn...");
                $("#turn-container").turn("next");
                deleteTurnSlide(_id);
                var newSlide = createTurnSlide(_id);
                $("#turn-container").turn("prev");
            } else {
                deleteTurnSlide(_id);
                var newSlide = createTurnSlide(_id);
            }



        }
    },
    //TODO : is the document still present when removed is called ?
    removed: function(_id) {
        if (Session.get("clientMode") === "turn") {
            logger.debug("slides.obsverchanges.removed.turn", _id);
            //required : get active slide (only if deleted current slide is a problem)
            // var activeSlideId = $("#turn-container >div .active").attr("id");
            // if (activeSlideId === _id && $("#turn-container >div").children().length !== 1) {
            //     //if we are on the deleted slide and it's not the last
            //     logger.debug("slides.obsverchanges.removed.turn : next slide");
            //     $("#turn-container").turn("next");
            // }
            deleteTurnSlide(_id);
        }
    }
});




/**
 *
 *   est ce que trun doit avoir ses propres elements textes
 *
 *
 * 
 */
