/*
 * key : slideshowTitle
 * value : [userIds...]
 * TODO : change key to slideshow._id
 */
slideshowPublished = {};

/*
 * TODO : manage group, play_mode, edit_mode, remote_mode
 */
presentationModeArray = ["default", "hybrid"];   //enum des types de pérsentations

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
 * SlidesLock :
 *  - slideId : slide._id
 *  - userId : user._id, null if slide is free to edit 
 *  Document add the first time the slide is edited
 *  All users have all collection
 */
SlidesLock = new Meteor.Collection("slidesLock");

/*
 * RemoteSlides :
 * - slideshowId : slideshow._id
 * - activeSlideId : slide._id, null si there is no active slide
 * - presentationMode : enum presentationMode
 * Document add when creating a slideshow
 */
Remotes = new Meteor.Collection("remoteSlides");


/*
 * TODO : publish only lock for slides linked to slideshow
 */
Meteor.publish('slidesLock', function() {
    return SlidesLock.find({}); //plus tard, ne pas envoyer l'id mais l'email, ou null si null
});




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


        if (Slideshow.find({"informations.title": options.title}).fetch().length != 0) {
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
            slides: []  //array of slides's Id

        }
        );

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
     * TODO : slidesLock of slides linked to the slideshow
     * TODO : verifier que le user connecté existe dans la db (accessoirement, qu'il soit connecté)
     * TODO : purge slideshowPublished si jamais un user avait précedement les accès à un slideshow
     * (très utile pour la creation des slides notamment)
     * TODO : les clients ne recoivent pas la liste des slideshows dont la slide fait partie ?
     */
    getSlideshow: function(options, userId) {
        //is the slideshow already publish ?
        if (typeof slideshowPublished[options.title] === "undefined") {
            console.log("infos : getSlideshow : publish slideshow ", options.title);

            var toPublish = Slideshow.find({
                'informations.title': options.title
            });

            if (toPublish.fetch().length == 0)
                throw new Meteor.Error(24200, "getSlideshow : publish error, seems like slideshow with title '", options.title, "' doesnt exists");


            Meteor.publish(options.title, function() {
                return Slideshow.find({
                    'informations.title': options.title
                });
            });

            slideshowPublished[options.title] = [];

            var newCreatedSlideshow = Slideshow.findOne({
                'informations.title': options.title
            });

            var remote = Remotes.find({
                'slideshowId': newCreatedSlideshow._id
            });
            if (remote.fetch().length == 0)
                throw new Meteor.Error(24200, "getSlideshow : publish error, seems like remote for slideshow with title '", options.title, "' doesnt exists");


            //publish slides related to the slideshow
            var strSlidesName = "slides" + options.title;
            Meteor.publish(strSlidesName, function() {
                return Slides.find({
                    slideshowReference: {$in: [newCreatedSlideshow._id]} //get all slides which are linked to the slideshow
//                   , {slideshowReference: 0 } //TODO gerer le fait que le client ne recoive pas cette donnée
                });
            });

            //publish elements related to the slides
            var slidesId = [];
            var slides = Slides.find({
                slideshowReference: {$in: [newCreatedSlideshow._id]}
            }, {fields: {_id: 1}}).fetch();
            for (var i in slides) {
                slidesId.push(slides[i]._id);
            }
            var strElementsName = "elements" + options.title;
            Meteor.publish(strElementsName, function() {
                return Elements.find({
                    slideReference: {$in: slidesId}//get all slides which are linked to the slideshow
//                   , {slideshowReference: 0 } //TODO gerer le fait que le client ne recoive pas cette donnée
                });
            });


            //publish remote of slideshow
            var strRemoteName = "remote" + options.title;
            Meteor.publish(strRemoteName, function() {
                return Remotes.find({
                    'slideshowId': newCreatedSlideshow._id
                });
            });
        }

        //add user to the list of current editors
        if (slideshowPublished[options.title].indexOf(userId) === -1)
            slideshowPublished[options.title].push(userId);

        return 1;
    },
    /*
     * also remove slides
     * TODO : remove only slides linker only to the slideshow
     */
    removeSlideshow: function(slideshowId, userId) {
        if (!hasAccessSlideshow(slideshowId, userId)) {
            throw new Meteor.Error("24300", "removeSlideshow, you are not allowed to perform this action");
        }

        //delete all slides linked to the slideshow
        Slides.remove({
            slideshowReference: {$in: [slideshowId]} //get all slides which are linked to the slideshow
        });

        Slideshow.remove({_id: slideshowId});
    },
    clearServerData: function() {
        console.log("dev : clear all db's data");
        Slideshow.remove({});
        Slides.remove({});
        Elements.remove({});
        SlidesLock.remove({});
        Remotes.remove({});
    }
});

/**
 * verifier dans slideshowPublished si userId est dans l'array des user allowed de slideshowId
 * @param {type} slideshowId
 * @param {type} userId
 * @returns {Array}
 * TODO : manage group, play_mode, edit_mode, remote_mode
 * 
 */
hasAccessSlideshow = function(slideshowId, userId) {

    var slideshowTitle = Slideshow.findOne({_id: slideshowId}).informations.title;


    if (typeof slideshowPublished[slideshowTitle] === "undefined") {
        console.log("error : hasAccessSlideshow : slideshow not present in slideshowPublished");
        return false;
    }

    if (slideshowPublished[slideshowTitle].indexOf(userId) === -1) {
        console.log("hasAccessSlideshow not contains");
        return false;
    }
    console.log("infos : hasAccessSlideshow : user ", userId, " granted access to ", slideshowPublished[slideshowTitle]);

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
            throw new Meteor.Error("Slideshow.allow.update : you are not allowed to update this slideshow");
            return false;
        }

        if (_.contains(fields, "presentationMode")) {
            if (presentationModeArray.indexOf(modifier.$set.presentationMode) === -1) {
                console.log("Slideshow.allow.update : presentationMode not allow ", modifier.$set.presentationMode);
                return false;
            }
            console.log("slideshow.allow.update : presentationMode ok");
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

/*
 * TODO : each action doit verifier que le user hasAccessSlideshow
 */
Slides.allow({
    /*
     * TODO : verifier que le user a l'accès au slideshow
     * TODO : verifier que la reference de slideshow est bonne (via userallowed)
     * TODO : add slideId dans array slide du slideshow (get id from slideshowPublished)
     * (en s'assurant qu'on ajoute la slide qu'à un seul slideshow)
     */
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

                var lock = SlidesLock.findOne({$and: [
                        {slideId: slide._id}, {userId: userId}
                    ]});

                if (typeof lock == 'undefined') {
                    console.log("info : slides.allow.update : client trying to update without lock slide : ", slide._id, "client :", userId);
                    return false;
                }
                console.log("info : slides.allow.update : allow title update");
            }
            return true;
        }


        console.log("info : slidesLock.allow.update pos : case not expected, return false");
        return false;

    },
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

Remotes.allow({
    insert: function() {
        return false;
    },
    /*
     * TODO : prendre en compte l'architecture (avec ca on peut avoir qu'une seule remote à la fois)
     */
    update: function(userId, newActiveSlide, fields, modifier) {
        return true;
        //si le client veut ajouter une slide active, le server refuse s'il y deja une slide active
        if (modifier.$set.state === "active" && typeof Remotes.findOne({state: "active"}) != "undefined") { //query must take care of the slidewhos of the remote
            console.log("RemoteSides.allow.update : try to add an active with one alreay set");
            return false;
        }
        return true;
    },
    remove: function() {
        return false;
    }
});

SlidesLock.allow({
    insert: function(userId, lock, fields, modifier) {
        return true;
    },
    update: function(userId, newLock, fields, modifier) {
        console.log("debug : slidesLock.update ", modifier);

        //verifie si le lock existe bel et bien
        var lock = SlidesLock.findOne({_id: newLock._id});
        if (typeof lock == 'undefined') {
            console.log("info : slideslock.update : lock doesn't exist ", newLock._id);
            throw new Meteor.Error("slideslock.update : lock doesn't exist ", newLock._id);
            return false;
        }

        //si ajout d'un lock
        if (modifier.$set.userId != null) {
            //verification que le lock n'écrase pas un lock
            if (lock.userId != null) {
                console.log("info : slidesLock.update : a lock is already set : db : ", lock._id, "new : ", newLock._id);
                return false;
            }
            console.log("info : slidesLock.update : add lock OK");
            return true;
        }

        //si suppresion d'un lock
        if (userId != lock.userId) {
            //verification que le lock est bien celui du user
            console.log("info : slidesLock.update : client try to remove a lock not set by him : robber ", userId, " locker : ", lock.userId);
            return false;
        } else {
            console.log("info : slidesLock.update : remove lock OK");
            return true;
        }

        console.log("info : slidesLock.update : case not expected, return false");
        return false;
    },
    remove: function() {
        //uniquement coté server si besoin
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


