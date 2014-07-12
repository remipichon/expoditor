PROCESS_ENV = ""; //variable d'environnement

Meteor.startup(function() {
    console.log(Meteor.exports);


    if (typeof process.env._METEOR === 'undefined') {
        console.log("****** INFOS *****");
        console.log("You can run this project in several mode");
        console.log(" $ _METEOR=prod meteor");
        console.log(" $ _METEOR=dev meteor");
        console.log("default is prod");
        console.log("****** / INFOS *****");
        PROCESS_ENV = "prod";
    } else {
        PROCESS_ENV = process.env._METEOR;
    }
    console.log("startup : mode ", PROCESS_ENV);


    if (PROCESS_ENV === "prod") {
        Locks.remove({});
        //belov code are bad but it's not intended to be often use
        var slides = Slides.find({}).fetch();
        if (slides.length !== 0) {
            console.log("warning : startup : there is slides remaining in slides collection (must be empty, something bad appends last shutdown");
            console.log("infos : startup : trying to recover data...");
            var slideshowId;
            var nbShittySlide = slides.length;

            while (slides.length !== 0) {
                slideshowId = slides[0].slideshowReference[0]; //get first slideshow of the first remaining slide
                console.log("infos : startup : trying to recover data for slideshow ", slideshowId);
                unloadToStore(slideshowId);
                if (--nbShittySlide === 0) {
                    console.log("infos : startup : recovering didn't success completely, remaining slides are deleted...");
                    Slides.remove({});
                    break;
                }
                slides = Slides.find({}).fetch();
            }
            var l = Elements.find({}).fetch().length;
            if (l !== 0) {
                console.log("warning : startup : there is -", l, "- elements remaining in elements collection (must be empty, something bad appends last shutdonw");
                console.log("infos : startup : remaining elements are deleted...");
                Elements.remove({});
            }

        }
    }

    console.log("Meteor startup sucessfully");
});



Hooks.onLoggedIn = function(userId) {
    console.log("******* onLoggedIn", userId)
}

Hooks.onLoggedOut = function(userId) {
    console.log("******* onLoggedOut", userId);
    removeAccessToSlideshowForUser(userId);
}

Hooks.onCloseSession = function(userId) {
    console.log("******* onCloseSession", userId);
    removeAccessToSlideshowForUser(userId);
}


removeAccessToSlideshowForUser = function(userId) {
    _.each(slideshowPublished, function(userArray, slideshowId) {
        var index = userArray.indexOf(userId);
        if (index !== -1) {
            console.log("removeAccessToSlideshowForUser", userId, "lost access to ", slideshowId);
            userArray.splice(index, 1);

            if (userArray.length === 0) {
                console.log("removeAccessToSlideshowForUser :slideshow ", slideshowId, " is no longer used by any user")
                unloadToStore(slideshowId);
            }
        }


    });
}

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
     * (très utile pour la creation des slides notamment)
     */
    getSlideshow: function(options, userId) {
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
            if (PROCESS_ENV !== "dev") {
                console.log("infos : getSlideshow : load slideshow");
                loadToEdit(slideshowId);
            }
            
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
                        //TODO je sais pas comment faire 
                        //arreter tous les handleElement créer dans les added
                        //handleElement.stop();
                        //il faut stopun handle par slide, comment les stocker jusq'ici
                    }
                });

                self.onStop(function() {
                    console.log("handleSlides.stop()");
                    handleSlides.stop();
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

        // purge slideshowPublished si jamais un user avait précedement les accès à un slideshow
        removeAccessToSlideshowForUser(userId);


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

    _clearServerData: function() {
        console.log("dev : clear all db's data");
        Slideshow.remove({});
        Slides.remove({});
        Elements.remove({});
        Locks.remove({});
        Remotes.remove({});
        slideshowPublished = {};
    },
    _clearDynamiqueServerData: function() {
        console.log("dev : clear dynamique server data");
        Locks.remove({});
        Remotes.remove({});
        slideshowPublished = {};
    },

    _unloadToStore: function(slideshowId) {
        console.log("dev : _unloadToStore");
        unloadToStore(slideshowId);
    },

    _loadToEdit: function(slideshowId) {
        console.log("dev : _loadToEdit");
        loadToEdit(slideshowId);
    },

    _getInfos: function() {
        var slideshows = Slideshow.find({}).fetch();
        var slides = Slides.find({}).fetch();
        var elements = Elements.find({}).fetch();
        var locks = Locks.find({}).fetch();
        return {
            slideshows: slideshows.length,
            slides: slides.length,
            elements: elements.length,
            locks: locks.length,
            slideshowPublished: slideshowPublished,

        }
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

/**
 * live load to edit
 */
test_liveLoadToEdit = function() {
    clearServerData();
    injectData();
    _unloadToStore(Slideshow.findOne({})._id);
    loadToEdit(Slideshow.findOne({})._id);
    //TODO verifier que les connlecions sont vide et que slideshow est plein
}

unloadToStore = function(slideshowId) {
    console.log("unloadToStore ", slideshowId);

    delete slideshowPublished[slideshowId];

    var slideshow = Slideshow.findOne({
        _id: slideshowId
    });
    var slides = slideshow.slides;

    var slide, slideElements, nb;
    _.each(slides, function(slideId) {
        console.log("unloadToStore slide ", slideId);
        if (typeof slideId === 'object') {
            console.log("unloadToStore : error : a slide is already an object");
            return;
        }


        //get all elements and the slide
        slideElements = Elements.find({
            slideReference: {
                $in: [slideId]
            } //get all elements which are linked to the slide
        }).fetch();
        slide = Slides.findOne({
            _id: slideId
        });

        console.log("unloadToStore elements ", slideElements);
        var elementToStore = [];
        _.each(slideElements, function(element) {
            console.log("unloadToStore element ", element._id);
            //add elements into the slide
            elementToStore.push(element);

            //purge collection.elements
            Elements.update(element._id, {
                $pull: {
                    slideReference: slideId
                }
            });
        });
        console.log("unloadToStore elementToStore ", elementToStore.length);
        //add elements into the slide
        nb = Slides.update(slideId, {
            $set: {
                elements: elementToStore
            }
        });

        slide = Slides.findOne({
            _id: slideId
        });

        //add the slide into slideshow
        Slideshow.update(slideshowId, {
            $push: {
                slides: slide
            }
        });
        Slideshow.update(slideshowId, {
            $pull: {
                slides: slideId
            }
        });

        //purge collection.slides
        Slides.remove({
            _id: slideId
        });

    });
    console.log("unloadToStore done");
};


loadToEdit = function(slideshowId) {
    console.log("loadToEdit ", slideshowId);
    var slideshow = Slideshow.findOne({
        _id: slideshowId
    });
    var slides = slideshow.slides;

    var slide, slideElements, nb;
    _.each(slides, function(slide) {
        console.log("loadToEdit slide ", slide._id);

        // insert slide in collection.slides
        Slides.insert(slide);

        // replace slide by its id in slideshow.slide
        Slideshow.update(slideshowId, {
            $pull: {
                slides: slide
            }
        });
        Slideshow.update(slideshowId, {
            $pull: {
                slides: slide._id
            }
        });
        Slideshow.update(slideshowId, {
            $push: {
                slides: slide._id
            }
        });

        // foreach element in slide.element
        _.each(slide.elements, function(element) {
            console.log("loadToEdit element", element._id);
            //  if element already in collection.elements
            if (typeof Elements.findOne({
                _id: element._id
            }) !== 'undefined') {
                //      add slide reference in element.slideReferences
                //      ==> déja le cas avant le unload donc c'est bon
            } else {
                Elements.insert(element);
                //      insert element in collection.elements

            }
        })
        // remove slide.element
        Slides.update(slide._id, {
            $set: {
                elements: []
            }
        })


    });
    console.log("loadToEdit done");

}