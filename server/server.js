//publishSlides = function() {
//    return Slides.find({}); //normalement il ne devrait y avoir qu'une presentation, 
//    //le requete se fera sur l'identifiant de la présentation
//};
//
//publishJmpressSlides = function() {
//    return Slides.find({type: "jmpressSlide"});
//};


publishSlidesLock = function() {
    return SlidesLock.find({}); //plus tard, ne pas envoyer l'id mais l'email, ou null si null
};

publishRemoteSlides = function() {
    return RemoteSlides.find({});
};

Meteor.methods({
//    testCallServer: function(str) {
//        console.log("client called with ", str);
//        Meteor.publish('slides', publishSlides);
//        return "hello";
//    },
    createSlideshow: function(options) {
        if (typeof options.title === "undefined") {
            throw new Meteor.Error(24100, "createSlideshow error : title args undefined");
        }

        //create Slideshow in DB
        if (Slideshow.find({"informations.title": options.title}).fetch().length != 0) {
            throw new Meteor.Error(24101, "createSlideshow error : title already exists");
        }
        var slideShow = Slideshow.insert({
            informations: {
                authors: "",
                title: options.title,
                date: ""
            },
            presentationMode: options.presentationMode || "default", // (typeof options.presentationMode === 'undefined') ? "default" : options.presentationMode;
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
            
    getSlideshowList: function(options, userId) {
        
        var idAndTitle = {};
        var title = [];
        //https://coderwall.com/p/o9np9q
        //Meteor doesn't (yet) support distinct mongo
        //return Slideshow.distinct("information.title");
        
        var allAvailableSlideshow = Slideshow.find({}).fetch();
        for( var i in allAvailableSlideshow){
            var slShw = allAvailableSlideshow[i];
            idAndTitle[slShw._id] = slShw.informations.title;
            title.push(slShw.informations.title);
        }
        console.log("getSlideshowList :",idAndTitle);   
        idAndTitle["titlesArray"] = title;
        return idAndTitle;
    },
    getSlideshow: function(options, userId) {
        //TODO
        //verifier que le user connecté existe dans la db (accessoirement, qu'il soit connecté)

        //TODO
        //purge slideshowPublished si jamais un user avait précedement les accès à un slideshow
        //(très utile pour la creation des slides notamment)




        //is the slideshow already publish ?
        if (typeof slideshowPublished[options.title] === "undefined") {
            console.log("getSlideshow : publish slideshow");


            //je peux pas faire autrement parce que le publish est asynchrone !
            var publish = Slideshow.find({
                'informations.title': options.title
            });
            if (publish.fetch().length == 0)
                throw new Meteor.Error(24200, "getSlideshow : publish error, seems like slideshow with title '", options.title, "' doesnt exists");

            //publish slideshow
            Meteor.publish(options.title, function() {
                return Slideshow.find({
                    'informations.title': options.title
                });
            });




            slideshowPublished[options.title] = [];

            //peut etre eviter de faire pleins de fois la requete !!!
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
                    slideshowReference: {$in: [newCreatedSlideshow._id]} //get all slides which are links to the slideshow
//                   , {slideshowReference: 0 } //TODO gerer le fait que le client ne recoive pas cette donnée
                });
            });



            var strRemoteName = "remote" + options.title;
            console.log("remote published :", Remotes.findOne({
                'slideshowId': newCreatedSlideshow._id
            })._id);
            Meteor.publish(strRemoteName, function() {
                return Remotes.find({
                    'slideshowId': newCreatedSlideshow._id
                });
            });



        }

        //add user to the list of current editors
        if (slideshowPublished[options.title].indexOf(userId) === -1)
            slideshowPublished[options.title].push(userId);

        console.log("slideshowPublised ", slideshowPublished);




        return "what to return ?";


        //options.presentationMode
    },
            
    removeSlideshow: function(slideshowId, userId) {
        if (!hasAccessSlideshow(slideshowId, userId)) {
            throw new Meteor.Error("24300", "removeSlideshow, you are not allowed to perform this action");
        }

        //TODO
        //delete all slides only links to the slideshow

        //delete all slides links to the slideshow
        Slides.remove({
            slideshowReference: {$in: [slideshowId]} //get all slides which are links to the slideshow
        });

        Slideshow.remove({_id: slideshowId});
    },
//    /*
//     * il faudrait que le slideshow.slides.allow utilise ces methodes
//     */
//    updateSlideTitle: function(slideshowId, slideId, title) {
//        console.log("updateSlideTitle slideshow : ", slideshowId, " slideId : ", slideId, " title : ", title);
//        Slideshow.update(
//                {_id: slideshowId, "slides._id": slideId},
//        {
//            $set: {
//                "slides.$.informations.title": title
//            }
//        }
//        );
//    },
//    /*
//     * il faudrait que le slideshow.slides.allow utilise ces methodes
//     */
//    updateSlidePos: function(slideshowId, slideId, pos) {
//        console.log("updateSlideTitle slideshow : ", slideshowId, " slideId : ", slideId, " title : ", pos);
//
//        Slideshow.update(
//                {_id: slideshowId, "slides._id": slideId},
//        {
//            $set: {
//                "slides.$.displayOptions.jmpress.positions": pos
//            }
//        }
//        );
//    },
    clearServerData: function() {
        Slideshow.remove({});
        Slides.remove({});
        SlidesLock.remove({});
        Remotes.remove({});
    }




});

/**
 * verifier dans slideshowPublished si userId est dans l'array des user allowed de slideshowId
 * @param {type} slideshowId
 * @param {type} userId
 * @returns {Array}
 */
hasAccessSlideshow = function(slideshowId, userId) {

    //plus tard il y aura l'id dans slideshowPublished (lorsque le title ne sera pas unique)
    var slideshowTitle = Slideshow.findOne({_id: slideshowId}).informations.title;
    console.log("hascaxess title ", slideshowTitle);

    if (typeof slideshowPublished[slideshowTitle] === "undefined") {
        console.log("hasAccessSlideshow undefined");
        return false;
    }
    console.log("has access userRight ", slideshowPublished[slideshowTitle]);
    if (slideshowPublished[slideshowTitle].indexOf(userId) === -1) {
        console.log("hasAccessSlideshow not contains");
        return false;
    }
    return true;
};

//stubGetSlideShow = function() {
//    Meteor.publish('test4',function(){
//       return Slideshow.find({'informations.title':'test4'}); 
//    });
//    Meteor.call('getSlideshow', {title: "test5"}, 'testID');
//};


//userAllowed = function(userId){
//    if( userId === null )
//        return false;
//};


if (Meteor.isServer) {

    /*
     * key : slideshowTitle
     * value : [userIds...]
     */
    slideshowPublished = {};
    presentationModeArray = ["default", "hybrid"];   //enum des types de pérsentations //mettre en bdd ? // publier ?

    Slides = new Meteor.Collection("slides");
//    Slides = new Meteor.Collection("slide");
    Slideshow = new Meteor.Collection("slideshow");
    SlidesLock = new Meteor.Collection("slidesLock");
    Remotes = new Meteor.Collection("remoteSlides");

    //publication des données
//    Meteor.publish('slides', publishSlides);
//    Meteor.publish('jmpressSlides', publishJmpressSlides);
    Meteor.publish('slidesLock', publishSlidesLock);
//    Meteor.publish('remoteSlides', publishRemoteSlides);

//    stubGetSlideShow();


    Meteor.startup(function() {
    });


    Slideshow.allow({
        insert: function() {
            //create via Meteor.method.createSlideshow
            return false;
        },
        update: function(userId, slideshow, fields, modifier) {
            console.log("info : ---- slideshiow.update ---- ");
            //check if user as legimately access to the slideshow
            if (!hasAccessSlideshow(slideshow._id, userId)) {
                console.log("slideshow.update : user not allowed to update slideshow slidehow : ", slideshow._id, " userid :", userId);
                throw new Meteor.Error("Slideshow.allow.update : you are not allowed to update this slideshow");
                return false;
            }

            //IMPORTANT  
            //traiter les cas ou le client met à jour plusieurs choses en meme temps
            //tel que plusieurs metadata


            //manage data that are not slides
            if (!_.contains(fields, "slides")) {
                if (_.contains(fields, "presentationMode")) {
                    if (presentationModeArray.indexOf(modifier.$set.presentationMode) === -1) {
                        console.log("Slideshow.allow.update : presentationMode not allow ", modifier.$set.presentationMode);
                        return false;
                    }

                    console.log("slideshow.allow.update : presentationMode ok");
                }




            }
            if (_.contains(fields, 'slides')) {
                console.log("slideshow.update : update slides : DOESNT EXIST ANYMORE !!!");
//                return slideshowAllowSlides(userId, slideshow, fields, modifier);
                return false;

            }


            //pour debug à true, doit etre passé à false
            console.log("Slideshow.allow.update : default allow, true");
            return true;

        },
        remove: function(userId, deleting) {
            //check if user as legimately access to the slideshow
//            if (!hasAccessSlideshow(slideshow._id, userId)) {
//                console.log("slideshow.update : user not allowed to update slideshow slidehow : ", slideshow._id, " userid :", userId);
//                throw new Meteor.Error("Slideshow.allow.update : you are not allowed to update this slideshow");
//                return false;
//            }

            //remove via Method.methods.removeSlideshow
            return false;

        }

    });


    Remotes.allow({
        insert: function() {
            return false;
        },
        update: function(userId, newActiveSlide, fields, modifier) {
            return true;
            //si le client veut ajouter une slide active, le server refuse s'il y deja une slide active
            if (modifier.$set.state === "active" && typeof Remotes.findOne({state: "active"}) != "undefined") {
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
            console.log("slidelock :", SlidesLock.find({}).fetch());
//            return true;

            //verifie si le lock existe bel et bien
            var lock = SlidesLock.findOne({_id: newLock._id});
            if (typeof lock == 'undefined') {
                console.log("info : slideslock.update : lock doesn't exist ", newLock._id);
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


    //le server ontrole certaines actions sur les slides
    Slides.allow({
        insert: function(userId, slide, fields, modifier) {
            //TODO
            //verifier que le user a l'accès au slideshow
            //TODO
            //verifier que la reference de slideshow est bonne (via userallowed)
            //TODO
            //add slideId dans array slide du slideshow (get id from slideshowPublished)
            //(en s'assurant qu'on ajoute la slide qu'à un seul slideshow)

            console.log("info : slides.allaow.insert : true ", slide);



            //je ne sais pas si c'est la bonne méthode de faire cela ici => ca va dans le subscribe, this.changed !!!
//            RemoteSlides.insert({
//                state: null,
//                slideId: slide._id
//            });


            return true;
        },
        update: function(userId, slide, fields, modifier) {
            //modifier est un object key value

//            console.log("slides.allow.update : server");
            console.log("modifier", modifier, typeof modifier);

            //display options
            if (_.contains(fields, 'displayOptions')) {
                //position
                if (modifier.toString().indexOf("positions") !== -1) { //pas funky ca
                    var position = slide.displayOptions.jmpress.positions;
                    console.log("slides.allow.update.pos : ", position, " _id : ", slide._id);
                }

                return true;
            }

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



            //update de title et position en exclusivité avec priorité au title

//    texte
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

///   
//    positionet fordidden zone
//            if (_.contains(fields, 'top') || _.contains(fields, 'left')) {
//                return true;
//
//                var topSlide = parseInt(modifier.$set.top);
//                var leftSlide = parseInt(modifier.$set.left);
//                var widthSlide = 150;
//                var heightSlide = 30;
//                var widthForbidenZone = 200;  // 2 d !
//                var heightForbidenZone = 200;
//                var topForbidenZone = 200;
//                var leftForbidenZone = 200;
//
////                si la mise à jour de la position proposée est dans la zone, on refuse l'update
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

            console.log("info : slidesLock.allow.update pos : case not expected, return false");
            return false;

        },
        remove: function() {
            return true;
        }
    });
}

//slideAllowInsert = function(userId, slideshow, fields, modifier) {
//    var slideId = modifier.$push.slides._id;
//    console.log("info : slides.allaow.insert : true : ", slideId);
//    //je ne sais pas si c'est la bonne méthode de faire cela ici => ca va dans le subscribe, this.changed !!!
////    Remotes.insert({
////        state: null,
////        slideId: slideId
////    });
//
//
//    return true;
//};
//
//slideAllowUpdateTitle = function(userId, slideshow, fields, modifier, slideId) {
////    var slideId = ??;
//
//
//
//    var lock = SlidesLock.findOne({$and: [
//            {slideId: slideId}, {userId: userId}
//        ]});
//
//    if (typeof lock == 'undefined') {
//        console.log("info : slides.allow.update : client trying to update without lock slide : ", slideId, "client :", userId);
//        return false;
//    }
//    console.log("info : slides.allow.update : allow title update");
//    return true;
//};

//slideAllowUpdatePositions = function(userId, slideshow, fields, modifier, slideId) {
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

//    //du coup le server recupere toutes les slides puis boucle pour determiner s'il doit traiter au non
//    var allSlides = Slides.find({}).fetch();
////            allSlides.forEach(function(slideBd) {
//    for (var i in allSlides) {
//        var slideBd = allSlides[i];
//        if (isCloseTo(slide, slideBd)) {
//            console.log(slide._id, " close to ", slideBd._id);
//            //on peut survoler une slide, mais pas droper dessus
//            //du coup on regarde si le lock sur la slide est encore là, sinon
//            //c'est que le client veut faire un drop
//            //je  ne sais pas si c'est top, si le client meure en cours de drag la slide pourrait
//            //etre posée sur une autre
//
////                    return false;
//        }
//                console.log("girafe");
//    return true;
//    }
//            });
//};

//
//slideshowAllowSlides = function(userId, slideshow, fields, modifier) {
//
//
//    if (typeof modifier.$push !== "undefined") {
//        console.log("slideshowAllowSlides : insert");
//        return slideAllowInsert(userId, slideshow, fields, modifier);
//    }
//
//    if (typeof modifier.$set !== "undefined") {
//        console.log("slideshowAllowSlides : update");
//        var query = Object.keys(modifier.$set)[0];
//        console.log("query : ", query);
//
////        console.log(slideshow);
//        //recuperer l'id de la slide via l'index présent dans la query
//        //vraiment pas top, parce qu'il faut aller choper l'id
//        //via une requete
////       var slideId = parseInt(str.match("[0-9]")[0]);
//        var slide = slideshow.slides[0];
////       console.log("slide : ",slide);
//        var slideId = slide._id;
////       console.log("slideId :",slideId);
//
//
//        if (query.indexOf("title") !== -1) {
//            console.log("slideshowAllowSlides : update title");
//            return slideAllowUpdateTitle(userId, slideshow, fields, modifier, slideId);
//        }
//
//        if (query.indexOf("positions") !== -1) {
//            console.log("slideshowAllowSlides : udpate positions");
//            return slideAllowUpdatePositions(userId, slideshow, fields, modifier, slideId);
//        }
//
//    }







//};



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
 
 *****************************/


