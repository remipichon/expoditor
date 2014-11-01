SlideshowHelper = function() {}

/**
 * verifier dans slideshowPublished si userId est dans l'array des user allowed de slideshowId
 * @param {type} slideshowId
 * @param {type} userId
 * @returns {Array}
 *
 */
SlideshowHelper.prototype.hasAccessSlideshow = function(slideshowId, userId) {
    var slideshow = Slideshow.findOne({
        _id: slideshowId
    });
    if (typeof slideshow === "undefined")
        throw new Meteor.Error("24", "slideshow does not exist " + slideshowId);

    //var slideshowTitle = slideshow.informations.title;


    if (typeof slideshowPublished[slideshowId] === "undefined") {
        logger.error("SlideshowHelper.prototype.hasAccessSlideshow : slideshow not present in slideshowPublished");
        return false;
    }

    if (slideshowPublished[slideshowId].indexOf(userId) === -1) {
        logger.info("SlideshowHelper.prototype.hasAccessSlideshow : user ", userId, " access denied to ", slideshowId);
        return false;
    }
    logger.info("SlideshowHelper.prototype.hasAccessSlideshow : user ", userId, " access granted to ", slideshowId);

    return true;
};

SlideshowHelper.prototype.removeAccessToSlideshowForUser = function(userId) {
    _.each(slideshowPublished, function(userArray, slideshowId) {
        var index = userArray.indexOf(userId);
        if (index !== -1) {
            logger.info("SlideshowHelper.prototype.removeAccessToSlideshowForUser", userId, "lost access to ", slideshowId);
            userArray.splice(index, 1);

            if (userArray.length === 0) {
                logger.info("SlideshowHelper.prototype.removeAccessToSlideshowForUser :slideshow ", slideshowId, " is no longer used by any user")
                SlideshowState.prototype.unloadToStore(slideshowId);
            }
        }


    });
}



//TODO : EXPO
/*
 * args :
 * - options : object
 * - - title : mandatory
 */
SlideshowHelper.prototype.createSlideshow = function(options, userId) {
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

    if (typeof remote == 'undefined') {
        throw new Meteor.Error(24, "error creating a slideshow's remote");
    }
    logger.info("SlideshowHelper.prototype.createSlideshow : _id", slideShow);
    return slideShow;
},
/*
 * returns : object
 * { slideshow._id : slideshow.informations.title
 * ...
 * titlesArray : [slideshow.informations.title,...]
 * }
 */
SlideshowHelper.prototype.getSlideshowList = function(options, userId) {
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
    logger.info("Methor.methods.getSlideshowList :", idAndTitle);
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
 * (très utile pour la creation des slides notamment)
 */
SlideshowHelper.prototype.getSlideshow = function(options, userId) {
    if (userId === null || typeof Meteor.users.findOne({
        _id: userId
    }) === "undefined") { //just check is userId actually exists
        throw new Meteor.Error(24200, "getSlideshow : publish error, you have to be connected'");
    }
    //TODO check if userId is legitamely connected (see gdoc)
    //https://github.com/mizzao/meteor-user-status

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

    //is the slideshow already publish ? if not, publish slideshow, linked slides an related elements
    if (typeof slideshowPublished[slideshowId] === "undefined") {
        logger.info("getSlideshow : load slideshow");
        SlideshowState.prototype.loadToEdit(slideshowId);

        logger.info("SlideshowHelper.prototype.getSlideshow : publish slideshow ", options.title, slideshowId);


        Meteor.publish(slideshowId, function() {
            return toPublish;
        });

        slideshowPublished[slideshowId] = [];

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
                    logger.info("SlideshowHelper.prototype.getSlideshow : element pusblish : added slide ", slideId);
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
                    //TODO je sais pas comment faire 
                    //arreter tous les handleElement créer dans les added
                    //handleElement.stop();
                    //il faut stopun handle par slide, comment les stocker jusq'ici
                }
            });

            self.onStop(function() {
                logger.info("SlideshowHelper.prototype.getSlideshow : handleSlides.stop()");
                handleSlides.stop();
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

    // purge slideshowPublished si jamais un user avait précedement les accès à un slideshow
    SlideshowHelper.prototype.removeAccessToSlideshowForUser(userId);


    //add user to the list of current editors
    if (slideshowPublished[slideshowId].indexOf(userId) === -1)
        slideshowPublished[slideshowId].push(userId);
    logger.info("SlideshowHelper.prototype.getSlideshow : done for user", userId, "on slideshow", slideshowId);
    return slideshowId;
},

//TODO : EXPO
SlideshowHelper.prototype.updateSlideshow = function(options, slideshowId, userId) {
    if (!SlideshowHelper.prototype.hasAccessSlideshow(slideshowId, userId)) {
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

//TODO : EXPO
//TODO : only if slideshow not in stored state
SlideshowHelper.prototype.removeSlideshow = function(slideshowId, userId) {
    if (!SlideshowHelper.prototype.hasAccessSlideshow(slideshowId, userId)) {
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

    //remove all user of the list of current editors
    if (typeof slideshowPublished[slideshowId] !== "undefined")
        delete slideshowPublished[slideshowId];
}


//API methods
Meteor.methods({

    createSlideshow: function(options, userId) {
        return SlideshowHelper.prototype.createSlideshow(options, userId);
    },

    getSlideshowList: function(options, userId) {
        return SlideshowHelper.prototype.getSlideshowList(options, userId);
    },

    getSlideshow: function(options, userId) {
        return SlideshowHelper.prototype.getSlideshow(options, userId);
    },

    updateSlideshow: function(options, slideshowId, userId) {
        return SlideshowHelper.prototype.updateSlideshow(options, slideshowId, userId);
    },

    removeSlideshow: function(slideshowId, userId) {
        return SlideshowHelper.prototype.removeSlideshow(slideshowId, userId);
    }

});