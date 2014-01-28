publishSlides = function() {
    return Slides.find({}); //normalement il ne devrait y avoir qu'une presentation, 
    //le requete se fera sur l'identifiant de la présentation
};

publishJmpressSlides = function() {
    return Slides.find({type: "jmpressSlide"});
};


publishSlidesLock = function() {
    return SlidesLock.find({}); //plus tard, ne pas envoyer l'id mais l'email, ou null si null
};

publishRemoteSlides = function() {
    return RemoteSlides.find({});
};

Meteor.methods({
    testCallServer: function(str) {
        console.log("client called with ", str);
        Meteor.publish('slides', publishSlides);
        return "hello";
    },
    createSlideshow: function(options) {
        if (typeof options.title === "undefined") {
            throw new Meteor.Error(24100, "createSlideshow error : title args undefined");
        }
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
            slides: []

        }
        );
        if (typeof slideShow == 'undefined') {
            throw new Meteor.Error(24, "error creating a slideshow");
        }

        return slideShow;
    },
    getSlideshow: function(options, userId) {



        //is the slideshow already publish ?
        if (typeof slideshowPublished[options.title] === "undefined") {
            console.log("getSlideshow : publish");


            //je peux pas faire autrement parce que le publish est asynchrone !
            var publish = Slideshow.find({
                'informations.title': options.title
            });
            if (publish.fetch().length == 0)
                throw new Meteor.Error(24200, "getSlideshow : publish error, seems like slideshow with title '", options.title, "' doesnt exists");



//          try {
            Meteor.publish(options.title, function() {
                return Slideshow.find({
                    'informations.title': options.title
                });


            });
//          }catch(err){
//            cConsole.log(err);
//          }



            slideshowPublished[options.title] = [];
        }

        //add user to the list of current editors
        if (slideshowPublished[options.title].indexOf(userId) === -1)
            slideshowPublished[options.title].push(userId);
        
        console.log("slideshowPublised ", slideshowPublished);

        return "what to return ?";


        //options.presentationMode
    }


});




if (Meteor.isServer) {

    /*
     * key : slideshowTitle
     * value : [userIds...]
     */
    slideshowPublished = {};

    Slides = new Meteor.Collection("slides");
//    Slides = new Meteor.Collection("slide");
    Slideshow = new Meteor.Collection("slideshow");
    SlidesLock = new Meteor.Collection("slidesLock");
    RemoteSlides = new Meteor.Collection("remoteSlides");

    //publication des données
    Meteor.publish('slides', publishSlides);
    Meteor.publish('jmpressSlides', publishJmpressSlides);
    Meteor.publish('slidesLock', publishSlidesLock);
    Meteor.publish('remoteSlides', publishRemoteSlides);


    Meteor.startup(function() {
    });


    Slideshow.allow({
        insert: function() {
            //create via Meteor.method.createSlideshow
            return false;
        },
        update: function(userId, updating, fields, modifier) {

        },
        remove: function(userId, deleting) {

        }

    });


    RemoteSlides.allow({
        insert: function() {
            return false;
        },
        update: function(userId, newActiveSlide, fields, modifier) {
            //si le client veut ajouter une slide active, le server refuse s'il y deja une slide active
            if (modifier.$set.state === "active" && typeof RemoteSlides.findOne({state: "active"}) != "undefined") {
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
            console.log("info : slides.allaow.insert : true ", slide);
            //je ne sais pas si c'est la bonne méthode de faire cela ici => ca va dans le subscribe, this.changed !!!
            RemoteSlides.insert({
                state: null,
                slideId: slide._id
            });


            return true;
        },
        update: function(userId, slide, fields, modifier) {

//            console.log("slides.allow.update : server");


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
            var allSlides = Slides.find({}).fetch();
//            allSlides.forEach(function(slideBd) {
            for (var i in allSlides) {
                var slideBd = allSlides[i];
                if (isCloseTo(slide, slideBd)) {
                    console.log(slide._id, " close to ", slideBd._id);
                    //on peut survoler une slide, mais pas droper dessus
                    //du coup on regarde si le lock sur la slide est encore là, sinon
                    //c'est que le client veut faire un drop
                    //je  ne sais pas si c'est top, si le client meure en cours de drag la slide pourrait
                    //etre posée sur une autre

//                    return false;
                }
//                console.log("girafe");
            }
//            });



            //update de title et position en exclusivité avec priorité au title

            //texte
            if (_.contains(fields, 'title')) {
                var lock = SlidesLock.findOne({$and: [
                        {slideId: slide._id}, {userId: userId}
                    ]});

                if (typeof lock == 'undefined') {
                    console.log("info : slides.allow.update : client trying to update without lock slide : ", slide._id, "client :", userId);
                    return false;
                }
                console.log("info : slides.allow.update : allow title update");
                return true;
            }


            //positionet fordidden zone
            if (_.contains(fields, 'top') || _.contains(fields, 'left')) {
                return true;

                var topSlide = parseInt(modifier.$set.top);
                var leftSlide = parseInt(modifier.$set.left);
                var widthSlide = 150;
                var heightSlide = 30;
                var widthForbidenZone = 200;  // 2 d !
                var heightForbidenZone = 200;
                var topForbidenZone = 200;
                var leftForbidenZone = 200;

                //si la mise à jour de la position proposée est dans la zone, on refuse l'update
                if (
                        (topForbidenZone < topSlide && topSlide < topForbidenZone + heightForbidenZone ||
                                topForbidenZone < topSlide + heightSlide && topSlide + heightSlide < topForbidenZone + heightForbidenZone)
                        &&
                        (leftForbidenZone < leftSlide && leftSlide < leftForbidenZone + widthForbidenZone ||
                                leftForbidenZone < leftSlide + widthSlide && leftSlide + widthSlide < leftForbidenZone + widthForbidenZone)
                        ) {
                    console.log("info : slides.allow.update pos : refuse pos update, forbidden zone");
                    return false;
                }
                console.log("info : slides.allow.update pos : allow pos update");
                return true;
            }

            console.log("info : slidesLock.allow.update pos : case not expected, return false");
            return false;
        },
        remove: function() {
            return true;
        }
    });
}



