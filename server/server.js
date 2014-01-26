publishSlides = function() {
    return Slides.find({});
};

publishJmpressSlides = function() {
    return Slides.find({type: "jmpressSlide"});
};

publishPlaneSlides = function() {
    return Slides.find({type: "planeSlide"});
};

publishSlidesLock = function() {
    return SlidesLock.find({}); //plus tard, ne pas envoyer l'id mais l'email, ou null si null
};

publishRemoteSlides = function() {
    return RemoteSlides.find({});
};


if (Meteor.isServer) {

    Slides = new Meteor.Collection("slides");
    SlidesLock = new Meteor.Collection("slidesLock");
    RemoteSlides = new Meteor.Collection("remoteSlides");

    //publication des données
    Meteor.publish('slides', publishSlides);
    Meteor.publish('planeSlides', publishPlaneSlides);
    Meteor.publish('jmpressSlides', publishJmpressSlides);
    Meteor.publish('slidesLock', publishSlidesLock);
    Meteor.publish('remoteSlides', publishRemoteSlides);


    Meteor.startup(function() {
        // code to run on server at startup
        if (Slides.find().count() != 0) {
            Slides.remove();
        }
    });

    RemoteSlides.allow({
        insert: function() {
            return false;
        },
        update: function(userId, newActiveSlide, fields, modifier) {
            //si le client veut ajouter une slide active, le server refuse s'il y deja une slide active
            if( modifier.$set.state === "active" && typeof RemoteSlides.findOne({state: "active"}) != "undefined" ){
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
            console.log("info : slides.allaow.insert : true ", slide );
            //je ne sais pas si c'est la bonne méthode de faire cela ici => ca va dans le subscribe, this.changed !!!
            RemoteSlides.insert({
               state: null,
               slideId: slide._id
            });
            
            
            return true;
        },
        update: function(userId, slide, fields, modifier) {
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


            //position
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


