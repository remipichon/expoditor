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


Meteor.methods({

    /*
     * args :
     * - options : object
     * - - title : mandatory
     */
    createSlideshow: function(options, userId) {
        if (typeof options.title === "undefined") {
            throw new Meteor.Error(24100, "createSlideshow error : title args undefined");
        }


        if (Slideshow.find({
            "informations.title": options.title
        }).fetch().length != 0) {
            throw new Meteor.Error(24101, "createSlideshow error : title already exists");
        }

        //create Slideshow in DB
        var slideShow = Slideshow.insert({
            informations: {
                authors: userId,
                title: options.title,
                date: ""
            },
            presentationMode: options.presentationMode || "default",
            slides: [] //array of slides's Id

        });

        if (typeof slideShow == 'undefined') {
            throw new Meteor.Error(24, "error creating a slideshow");
        }

        //create remote in DB
        var remote = Remotes.insert({
            slideshowId: slideShow,
            activeSlideId: null,
            presentationMode: 'default'
        });

        if (typeof remote == 'undefined') {
            throw new Meteor.Error(24, "error creating a slideshow's remote");
        }
        console.log("info : createSlideshow : created id :", slideShow);
        return slideShow;
    },
    /*
     * returns : object
     * { slideshow._id : slideshow.informations.title
     * ...
     * titlesArray : [slideshow.informations.title,...]
     * }
     */
    getSlideshowList: function(options, userId) {
        var idAndTitle = {};
        var title = [];

        //Meteor doesn't (yet) support distinct mongo
        //return Slideshow.distinct("information.title");

        var allAvailableSlideshow = Slideshow.find({}).fetch();
        for (var i in allAvailableSlideshow) {
            var slShw = allAvailableSlideshow[i];
            idAndTitle[slShw._id] = slShw.informations.title;
            title.push(slShw.informations.title);
        }
        console.log("infos : Methor.methods.getSlideshowList :", idAndTitle);
        idAndTitle["titlesArray"] = title;
        return idAndTitle;
    },
    /*
     * args :
     * - options : object
     * - - title : mandatory
     * create all mandatory subscriptions related to a slideshow :
     * - slideshow : "{title}"
     * - all slides link to slideshow : "{slidestitle}"
     * - remote of the slideshow : "{remotetitle}"
     * TODO : verifier que le user connecté existe dans la db (accessoirement, qu'il soit connecté)
     * TODO : purge slideshowPublished si jamais un user avait précedement les accès à un slideshow
     * (très utile pour la creation des slides notamment)
     * TODO : les clients ne recoivent pas la liste des slideshows dont la slide fait partie ?
     * TODO : traiter correctement les fin des handlers sur les observeChanges (tableau de handleElement et les handleSlides)
     */
    getSlideshow: function(options, userId) {
        var slideshowAsked = Slideshow.find({
            'informations.title': options.title
        });

        var res = slideshowAsked.fetch();
        if (res.length === 0) //je  omprends pas pourquoi mais j'ai l'impression que le slideshowAsked n'est lisible qu'une fois...
            throw new Meteor.Error(24200, "getSlideshow : publish error, seems like slideshow  doesnt exists'", options.title);
        var slideshowId = res[0]._id;

        var toPublish = Slideshow.find({
            _id: slideshowId
        })

        //is the slideshow already publish ?
        if (typeof slideshowPublished[slideshowId] === "undefined") {
            console.log("infos : getSlideshow : publish slideshow ", options.title, slideshowId);


            Meteor.publish(slideshowId, function() {
                return toPublish;
            });

            slideshowPublished[slideshowId] = [];


            var remote = Remotes.find({
                'slideshowId': slideshowId
            });
            if (remote.fetch().length == 0)
                throw new Meteor.Error(24200, "getSlideshow : publish error, seems like remote for slideshow with title '", options.title, "' doesnt exists");


            //publish slides related to the slideshow
            var strSlidesName = "slides" + slideshowId;
            Meteor.publish(strSlidesName, function() {
                return Slides.find({
                    slideshowReference: {
                        $in: [slideshowId]
                    }
                });
            });

            //publish elements related to all slides of the slideshow           
            var strElementsName = "elements" + slideshowId;
            Meteor.publish(strElementsName, function() {
                var self = this;

                var handleSlides = Slides.find({
                    slideshowReference: {
                        $in: [slideshowId]
                    } //[newCreatedSlideshowId]}
                }).observeChanges({
                    added: function(slideId, slide) {
                        //slide ajouté, il faut ajouter ses elements à la publication
                        console.log("element pusblish : added slide ", slideId);
                        var handleElement = Elements.find({
                            slideReference: {
                                $in: [slideId]
                            } //get all slides which are linked to the slideshow
                        }).observeChanges({
                            added: function(eleId, ele) {
                                self.added("elements", eleId, ele);
                            },
                            changed: function(eleId, fields) {
                                self.changed("elements", eleId, fields);
                            },
                            removed: function(eleId, ele) {
                                self.removed("elements", eleId, ele);
                            }
                        });
                    },
                    changed: function(slideId, fields) {
                        //nothing to do
                    },
                    removed: function(slideId, slide) {
                        //TODO
                        //arreter tous les handleElement créer dans les added
                    }
                });
            });


            //publish remote of slideshow
            var strRemoteName = "remote" + slideshowId;
            Meteor.publish(strRemoteName, function() {
                return Remotes.find({
                    'slideshowId': slideshowId
                });
            });


            //publish components locks
            var strLocksName = "locks" + slideshowId;
            Meteor.publish(strLocksName, function() {
                return Locks
                    .find({
                        'slideshowId': slideshowId
                    });
            });


        }

        //add user to the list of current editors
        if (slideshowPublished[slideshowId].indexOf(userId) === -1)
            slideshowPublished[slideshowId].push(userId);

        return slideshowId;
    },
    updateSlideshow: function(options, slideshowId, userId) {
        console.log('pdateSlideshow', options, slideshowId, userId);
        if (!hasAccessSlideshow(slideshowId, userId)) {
            throw new Meteor.Error(24300, "updateSlideshow, you are not allowed to perform this action");
        }
        if (Slideshow.find({
            "informations.title": options.title
        }).fetch().length != 0) {
            throw new Meteor.Error(24101, "updateSlideshow error : title already exists");
        }
        if (typeof options.title !== 'undefined') {
            Slideshow.update({
                _id: slideshowId
            }, {
                $set: {
                    'informations.title': options.title
                }
            });
        }

    },
    /*
     * also remove slides
     * TODO : remove only slides linked only to the slideshow (if a slide is in different slideshow...)
     * NOT TODO : remove elements linkend to the slideshow => sera fait lorsque sera implementé
     * le liveLoadToEdit
     */
    removeSlideshow: function(slideshowId, userId) {
        if (!hasAccessSlideshow(slideshowId, userId)) {
            throw new Meteor.Error(24300, "removeSlideshow, you are not allowed to perform this action");
        }

        //delete all slides linked to the slideshow
        Slides.remove({
            slideshowReference: {
                $in: [slideshowId]
            } //get all slides which are linked to the slideshow
        });

        Slideshow.remove({
            _id: slideshowId
        });
    },

    clearServerData: function() {
        console.log("dev : clear all db's data");
        Slideshow.remove({});
        Slides.remove({});
        Elements.remove({});
        Locks.remove({});
        Remotes.remove({});
        slideshowPublished = {};
    }
});

/**
 * verifier dans slideshowPublished si userId est dans l'array des user allowed de slideshowId
 * @param {type} slideshowId
 * @param {type} userId
 * @returns {Array}
 *
 */
hasAccessSlideshow = function(slideshowId, userId) {
    var slideshow = Slideshow.findOne({
        _id: slideshowId
    });
    if (typeof slideshow === "undefined")
        throw new Meteor.Error("24", "slideshow does not exist " + slideshowId);

    //var slideshowTitle = slideshow.informations.title;


    if (typeof slideshowPublished[slideshowId] === "undefined") {
        console.log("error : hasAccessSlideshow : slideshow not present in slideshowPublished");
        return false;
    }

    if (slideshowPublished[slideshowId].indexOf(userId) === -1) {
        console.log("infos : hasAccessSlideshow : user ", userId, " access denied to ", slideshowId);
        return false;
    }
    console.log("infos : hasAccessSlideshow : user ", userId, " access granted to ", slideshowId);

    return true;
};



Slideshow.allow({
    insert: function() {
        //create via Meteor.method.createSlideshow
        return false;
    },
    /*
     * TODO : traiter le cas ou le client met à jour plusieurs fields
     * TODO : update de slides (array de slides._id
     */
    update: function(userId, slideshow, fields, modifier) {
        console.log("info : slideshiow.update");

        if (!hasAccessSlideshow(slideshow._id, userId)) {
            console.log("info : slideshow.update : user not allowed to update slideshow slidehow : ", slideshow._id, " userid :", userId);
            throw new Meteor.Error("24", "Slideshow.allow.update : you are not allowed to update this slideshow");
            return false;
        }


        if (_.contains(fields, 'slides')) {
            console.log("slideshow.update : update slides : TODO");
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


});



/*
 * TODO : each action doit verifier que le user hasAccessSlideshow
 * TODO : traitement factorisé pour la gestion du lock à l'image du coté client
 */
Slides.allow({
    insert: function(userId, slide, fields, modifier) {
        console.log("info : slides.allow.insert : true ", slide);
        return true;
    },
    /*   
     * TODO : traiter le cas ou le client met à jour plusieurs fields
     * TODO : une méthode qui decomposer le modifier dans un tableau [subdoc, subsubdoc, subsubsubdoc] si modifier : {subdoc.subsubdoc.subsubsubdoc : value}
     * afin de faciliter le traitement sur un update de nested document
     */
    update: function(userId, slide, fields, modifier) {
        console.log("slides.allow.update : ", slide._id);

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

            return true;
        }

        //update de title et position en exclusivité avec priorité au title

        //metadata
        if (_.contains(fields, 'informations')) {
            if (modifier.toString().indexOf("title") !== -1) { //pas funky ca

                var lock = Locks.findOne({
                    $and: [{
                        componentId: slide._id
                    }, {
                        userId: userId
                    }]
                });

                if (typeof lock == 'undefined') {
                    console.log("info : slides.allow.update : client trying to update without lock slide : ", slide._id, "client :", userId);
                    return false;
                }
                console.log("info : slides.allow.update : allow title update");
            }
            return true;
        }

        //order
        if (_.contains(fields, 'order')) {
            //TODO
            return true;
        }


        console.log("info : slidesLock.allow.update pos : case not expected, return false");
        return false;

    },
    /*
     * delete relating elements
     */
    remove: function() {
        return true;
    }
});

Elements.allow({
    /*
     * TODO
     *
     */
    insert: function() {
        return true;
    },
    update: function() {
        return true;
    },
    remove: function() {
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
        //uniquement coté server lors du unload
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