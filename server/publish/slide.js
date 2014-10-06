Slides = new Meteor.Collection("slides");



Slides.after.insert(function(userId, slide, fields, modifier, options) {
    //add slide reference in arraySlide of each slideshow
    _.each(slide.slideshowReference, function(slideshowId) {
        Slideshow.update({
            _id: slideshowId
        }, {
            $push: {
                slides: slide._id
            }

        });
    });

});

Slides.after.remove(function(userId, slide) {
    //remove slide reference in arraySlide of each slideshow
    _.each(slide.slideshowReference, function(slideshowId) {
        Slideshow.update({
            _id: slideshowId
        }, {
            $pull: {
                slides: slide._id
            }
        });

    });

    //delete reference in slideReference of each of the element 
    Elements.update({
        slideReference: {
            $in: [slide._id]
        }
    }, {
        $pull: {
            slideReference: slide._id
        }
    }, {
        multi: true
    });

});


Slides.after.remove(function(userId, element) {
    Locks.remove({
        componentId: element._id
    });
});



/*
 * TOTEST : traitement factorisé pour la gestion du lock à l'image du coté client
 */
Slides.allow({
    insert: function(userId, slide, fields, modifier) {
        return true;
        //slideshow access control
        _.each(slide.slideshowReference, function(slideshowId) {
            if (!hasAccessSlideshow(slideshowId, userId))
                throw new Meteor.Error("24", "slides.insert : user has not access to slideshow ", lock.slideshowId);
        });

        logger.log("info : slides.allow.insert : true ", slide);
        return true;
    },
    update: function(userId, slide, fields, modifier) {
        return true;
        logger.log("slides.allow.update : ", slide._id);

        var toReturn = false;

        //slideshow access control
        _.each(slide.slideshowReference, function(slideshowId) {
            if (!hasAccessSlideshow(slideshowId, userId))
                throw new Meteor.Error("24", "slides.update : user has not access to slideshow ", slideshowId);
        });


        //lock control
        if (!userHasAccessToComponent(slide, fields)) {
            logger.log("slides.allow.update : user does not have access to update fiels " + fields);
            throw new Meteor.Error("slides.allow.update : user does not have access to update fiels " + fields);
        }

        //display options
        if (_.contains(fields, 'displayOptions')) {
            //position
            if (modifier.toString().indexOf("positions") !== -1) { //pas funky ca
                var position = slide.displayOptions.jmpress.positions;
                logger.log("slides.allow.update.pos : ", position, " _id : ", slide._id);
            }

            toReturn = true;
        }

        //metadata
        if (_.contains(fields, 'informations')) {
            if (modifier.toString().indexOf("title") !== -1) { //pas funky ca

                var lock = Locks.findOne({
                    $and: [{
                        componentId: slide._id
                    }, {
                        'user.userId': userId
                    }]
                });

                if (typeof lock == 'undefined') {
                    logger.log("info : slides.allow.update : client trying to update without lock slide : ", slide._id, "client :", userId);
                    return false;
                }
                logger.log("info : slides.allow.update : allow title update");
            }
            toReturn = true;
        }

        //order, only check if order index is N
        if (_.contains(fields, 'order')) {
            var allSlides = Slides.find({
                slideshowReference: {
                    $in: [slide.slideshowReference[0]]
                }
            }, {
                sort: {
                    order: 1
                }
            }).fetch();

            var cpt = 1;
            _.each(allSlides, function(slide) {
                if (slide.order != cpt++) {
                    toReturn = false;
                    return;
                }
            });

            toReturn = true;
        }

        if (toReturn) {
            return true;
        }


        logger.log("info : slidesLock.allow.update pos : case not expected, return false");
        return false;

    },
    remove: function(userId, slide) {
        return true;
        //slideshow access control
        _.each(slide.slideshowReference, function(slideshowId) {
            if (!hasAccessSlideshow(slideshowId, userId))
                throw new Meteor.Error("24", "slides.delete : user has not access to slideshow ", lock.slideshowId);
        });
        return true;
    }
});




/****************************
 * do not delete
 //positionet fordidden zone
 //            if (_.contains(fields, 'top') || _.contains(fields, 'left')) {
 //                return true;
 
 //                var topSlide = parseInt(modifier.$set.top);
 //                var leftSlide = parseInt(modifier.$set.left);
 //                var widthSlide = 150;
 //                var heightSlide = 30;
 //                var widthForbidenZone = 200;  // 2 d !
 //                var heightForbidenZone = 200;
 //                var topForbidenZone = 200;
 //                var leftForbidenZone = 200;
 
 //                si la mise à jour de la position proposée est dans la zone, on refuse l'update
 //                if (
 //                        (topForbidenZone < topSlide && topSlide < topForbidenZone + heightForbidenZone ||
 //                                topForbidenZone < topSlide + heightSlide && topSlide + heightSlide < topForbidenZone + heightForbidenZone)
 //                        &&
 //                        (leftForbidenZone < leftSlide && leftSlide < leftForbidenZone + widthForbidenZone ||
 //                                leftForbidenZone < leftSlide + widthSlide && leftSlide + widthSlide < leftForbidenZone + widthForbidenZone)
 //                        ) {
 //                    logger.log("info : slides.allow.update pos : refuse pos update, forbidden zone");
 //                    return false;
 //                }
 //                logger.log("info : slides.allow.update pos : allow pos update");
 //                return true;
 //            }
 //
 //            logger.log("info : slidesLock.allow.update pos : case not expected, return false");
 //            return false;
 
 //  ne pas superposer des slides
 //je capte pas pourquoi le requete retourne toutes les slides en server, 
 //alors que ca marche super en client
 //impossible de superposer deux slides
 //            var closerSlides = getCloserSlide(slide._id, {x: slide.left, y:slide.top});
 //            logger.log(closerSlides.length);
 
 //            logger.log(slide._id, slide.left, slide.top);
 //            if( closerSlides.length != 0 ){
 //                logger.log("Slides.allow.update : trop proche d'une slide");
 //                return false;
 //            }
 
 //du coup le server recupere toutes les slides puis boucle pour determiner s'il doit traiter au non
 //            var allSlides = Slides.find({}).fetch();
 ////            allSlides.forEach(function(slideBd) {
 //            for (var i in allSlides) {
 //                var slideBd = allSlides[i];
 //                if (isCloseTo(slide, slideBd)) {
 //                    logger.log(slide._id, " close to ", slideBd._id);
 //////                    //on peut survoler une slide, mais pas droper dessus
 ////                    //du coup on regarde si le lock sur la slide est encore là, sinon
 ////                    //c'est que le client veut faire un drop
 ////                    //je  ne sais pas si c'est top, si le client meure en cours de drag la slide pourrait
 //                    //etre posée sur une autre
 ////
 //                    return false;
 //                }
 //                logger.log("girafe");
 //            }
 //            });
 *****************************/