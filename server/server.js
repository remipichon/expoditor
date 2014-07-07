//Users = new Meteor.Collection('users');


/*
 * key : slideshowID
 * value : [userIds...]
 */
slideshowPublished = {};

/*
 * see http://titanpad.com/expo
 */
Elements = new Meteor.Collection("elements");

/*
 * see http://titanpad.com/expo
 */
Slides = new Meteor.Collection("slides");

/*
 * see http://titanpad.com/expo
 */
Slideshow = new Meteor.Collection("slideshow");

/*
 * see http://titanpad.com/expo
 */
Locks = new Meteor.Collection("lock");

/*
 * RemoteSlides :
 * - slideshowId : slideshow._id
 * - activeSlideId : slide._id, null si there is no active slide
 * - presentationMode : enum presentationMode
 * Document add when creating a slideshow
 */
Remotes = new Meteor.Collection("remoteSlides");





Slideshow.allow({
    insert: function() {
        //create via Meteor.method.createSlideshow
        return false;
    },
    update: function(userId, slideshow, fields, modifier) {
        console.log("info : slideshiow.update");

        if (!hasAccessSlideshow(slideshow._id, userId)) {
            console.log("info : slideshow.update : user not allowed to update slideshow slidehow : ", slideshow._id, " userid :", userId);
            throw new Meteor.Error("24", "Slideshow.allow.update : you are not allowed to update this slideshow");
            return false;
        }

        console.log("Slideshow.allow.update : default allow, true");
        return true;

    },
    remove: function(userId, deleting) {
        //remove via Method.methods.removeSlideshow
        return false;
    }

});


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

        console.log("info : slides.allow.insert : true ", slide);
        return true;
    },
    update: function(userId, slide, fields, modifier) {
        return true;
        console.log("slides.allow.update : ", slide._id);

        var toReturn = false;

        //slideshow access control
        _.each(slide.slideshowReference, function(slideshowId) {
            if (!hasAccessSlideshow(slideshowId, userId))
                throw new Meteor.Error("24", "slides.update : user has not access to slideshow ", slideshowId);
        });


        //lock control
        if (!userHasAccessToComponent(slide, fields)) {
            console.log("slides.allow.update : user does not have access to update fiels " + fields);
            throw new Meteor.Error("slides.allow.update : user does not have access to update fiels " + fields);
        }

        //display options
        if (_.contains(fields, 'displayOptions')) {
            //position
            if (modifier.toString().indexOf("positions") !== -1) { //pas funky ca
                var position = slide.displayOptions.jmpress.positions;
                console.log("slides.allow.update.pos : ", position, " _id : ", slide._id);
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
                    console.log("info : slides.allow.update : client trying to update without lock slide : ", slide._id, "client :", userId);
                    return false;
                }
                console.log("info : slides.allow.update : allow title update");
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


        console.log("info : slidesLock.allow.update pos : case not expected, return false");
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



// when updating element, if slideReference is empty, delete element
Elements.after.update(function(userId, element, fields, modifier, options) {
    console.log("elements.update.after");
    //slide reference, if empty : delete element
    if (_.contains(fields, 'slideReference')) {
        if (_.isEmpty(element.slideReference)) {
            console.log("element removed ", element._id);
            Elements.remove({
                _id: element._id
            });
        }

    }
});

Elements.after.remove(function(userId, element) {
    Locks.remove({
        componentId: element._id
    });
});


Elements.allow({
    insert: function(userId, element, fields, modifier) {
        return true;
        //slideshow access controll
        var slide = Slides.findOne({
            _id: element.slideReference[0]
        });
        console.log("info : elements.allow.insert : slide", slide._id);
        if (!hasAccessSlideshow(slide.slideshowReference[0], userId))
            throw new Meteor.Error("24", "elements.insert : user has not access to slideshow ", lock.slide.slideshowReference);


        console.log("info : elements.allow.insert : true ", element);
        return true;
    },
    update: function(userId, element, fields, modifier) {
        return true;
        console.log("elements.allow.update : ", element._id);

        var toReturn = false;

        //slideshow access controll
        var slide = Slides.findOne({
            _id: element.slideReference[0]
        });
        console.log("info : elements.allow.insert : slide", slide._id);
        if (!hasAccessSlideshow(slide.slideshowReference[0], userId))
            throw new Meteor.Error("24", "elements.insert : user has not access to slideshow ", lock.slide.slideshowReference);



        //lock control
        if (!userHasAccessToComponent(element, fields)) {
            console.log("elements.allow.update : user does not have access to update fiels " + fields);
            throw new Meteor.Error("elements.allow.update : user does not have access to update fiels " + fields);
        }

        //display options
        if (_.contains(fields, 'displayOptions')) {
            //position
            if (modifier.toString().indexOf("positions") !== -1) { //pas funky ca
                var position = element.displayOptions.jmpress.positions;
                console.log("elements.allow.update.pos : ", position, " _id : ", element._id);
            }

            toReturn = true;
        }



        //content
        if (_.contains(fields, 'content')) {
            //            if (modifier.toString().indexOf("title") !== -1) { //pas funky ca
            console.log("elements.allow.update elementId", element._id);
            var lock = Locks.findOne({
                $and: [{
                    componentId: element._id
                }, {
                    'user.userId': userId
                }]
            });
            console.log("elements.allow.updat lock", lock);
            if (typeof lock == 'undefined') {
                console.log("info : elements.allow.update : client trying to update without lock element : ", element._id, "client :", userId);
                return false;
            }
            console.log("info : elements.allow.update : allow content update");

            toReturn = true;
        }



        if (toReturn) {
            return true;
        }


        console.log("info : elementsLock.allow.update pos : case not expected, return false");
        return false;

    },
    remove: function(userId, element) {
        return true;
        //slideshow access controll
        var slide = Slides.findOne({
            _id: element.slideReference[0]
        });
        console.log("info : elements.allow.insert : slide", slide._id);
        if (!hasAccessSlideshow(slide.slideshowReference[0], userId))
            throw new Meteor.Error("24", "elements.insert : user has not access to slideshow ", lock.slide.slideshowReference);


        return true;
    }
});

/*
 *  Project de ClaireZed
 */
Remotes.allow({
    insert: function() {
        return false;
    },
    update: function(userId, newActiveSlide, fields, modifier) {
        return true;
        //si le client veut ajouter une slide active, le server refuse s'il y deja une slide active
        if (modifier.$set.state === "active" && typeof Remotes.findOne({
            state: "active"
        }) != "undefined") { //query must take care of the slidewhos of the remote
            console.log("RemoteSides.allow.update : try to add an active with one alreay set");
            return false;
        }
        return true;
    },
    remove: function() {
        return false;
    }
});

Locks.allow({
    insert: function(userId, lock, fields, modifier) {
        //check slideshow
        if (typeof lock.slideshowId === "undefined")
            throw new Meteor.Error("24", "lock.insert : lock does not contain a slideshowId");
        if (!hasAccessSlideshow(lock.slideshowId, userId))
            throw new Meteor.Error("24", "lock.insert : user has not access to slideshow ", lock.slideshowId);


        //check component
        if (typeof lock.componentId === "undefined")
            throw new Meteor.Error("24", "lock.insert : lock does not contain a componentId");
        if (Locks.findOne({
            componentId: lock.componentId
        }))
            throw new Meteor.Error("24", "lock.insert : a lock already exists for the component ", lock.componentId);

        //check userId
        if (typeof lock.user.userId === "undefined")
            throw new Meteor.Error("24", "lock.insert : lock does not contain a userId");
        if (userId !== lock.user.userId)
            throw new Meteor.Error("24", "lock.insert : lock's userId ", lock.userId, " does not correspond to client's userId ", userId);

        //check userId
        if (typeof lock.properties === "undefined" || !Array.isArray(lock.properties))
            throw new Meteor.Error("24", "lock.insert : lock does not contain a properties array");


        console.log("infos : Locks.allow : insert : true");
        return true;
    },
    update: function(userId, newLock, fields, modifier) {
        console.log("infos : slidesLock.update ", modifier);

        //verifie si le lock existe bel et bien
        var lock = Locks.findOne({
            _id: newLock._id
        });
        if (typeof lock == 'undefined') {
            console.log("info : lock.update : lock doesn't exist ", newLock._id);
            throw new Meteor.Error("24", "lock.update : lock doesn't exist ", newLock._id);
            return false;
        }

        //si ajout d'un lock
        if (modifier.$set.user != null) {
            //verification que le lock n'écrase pas un lock
            if (lock.user != null) {
                console.log("info : lock.update : a lock is already set : db : ", lock._id, "new : ", newLock._id);
                return falsel;
            }
            console.log("info : lock.update : add lock OK");
            return true;
        }

        //si suppresion d'un lock
        if (userId != lock.user.userId) {
            //verification que le lock est bien celui du user
            console.log("info : slidesLock.update : client try to remove a lock not set by him : robber ", userId, " locker : ", lock.user.userId);
            return false;
        } else {
            console.log("info : slidesLock.update : remove lock OK");
            return true;
        }

        console.log("info : slidesLock.update : case not expected, return false");
        return false;
    },
    remove: function() {
        return false;
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
 //                    console.log("info : slides.allow.update pos : refuse pos update, forbidden zone");
 //                    return false;
 //                }
 //                console.log("info : slides.allow.update pos : allow pos update");
 //                return true;
 //            }
 //
 //            console.log("info : slidesLock.allow.update pos : case not expected, return false");
 //            return false;
 
 //  ne pas superposer des slides
 //je capte pas pourquoi le requete retourne toutes les slides en server, 
 //alors que ca marche super en client
 //impossible de superposer deux slides
 //            var closerSlides = getCloserSlide(slide._id, {x: slide.left, y:slide.top});
 //            console.log(closerSlides.length);
 
 //            console.log(slide._id, slide.left, slide.top);
 //            if( closerSlides.length != 0 ){
 //                console.log("Slides.allow.update : trop proche d'une slide");
 //                return false;
 //            }
 
 //du coup le server recupere toutes les slides puis boucle pour determiner s'il doit traiter au non
 //            var allSlides = Slides.find({}).fetch();
 ////            allSlides.forEach(function(slideBd) {
 //            for (var i in allSlides) {
 //                var slideBd = allSlides[i];
 //                if (isCloseTo(slide, slideBd)) {
 //                    console.log(slide._id, " close to ", slideBd._id);
 //////                    //on peut survoler une slide, mais pas droper dessus
 ////                    //du coup on regarde si le lock sur la slide est encore là, sinon
 ////                    //c'est que le client veut faire un drop
 ////                    //je  ne sais pas si c'est top, si le client meure en cours de drag la slide pourrait
 //                    //etre posée sur une autre
 ////
 //                    return false;
 //                }
 //                console.log("girafe");
 //            }
 //            });
 *****************************/