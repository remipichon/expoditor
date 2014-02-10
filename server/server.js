addHandleSlide = function(self) {

};

publishSlides = function() { //pseudo slideshow
//    return Slides.find({});
    var pseudoSlideshowId = "CxqBw4c2oyDDoHkYr";
    var self = this;
//    console.log("\nobservechange\n",
//            Slides.find({_id: "qkBPHySDuarpWvmPs"
//                , "sub1.attr121": "121Value"
//    }
//    , {fields: {"sub1.$": 1}}  //donc là on ne chope qu'une slide
//    )
//            .fetch()
//
//            );
    
    //publication du slideshow
     var slide = Slides.findOne({
                _id: pseudoSlideshowId
            });
     console.log("publication pseudo slideshow", slide._id);
     self.added("slides", pseudoSlideshowId, slide);


    //pour ajouter une slide, on ne regarde que l'attribut slide (sub1) (ne prend pas en compte la structure complexe)
    var handle = Slides.find({_id: pseudoSlideshowId, "sub1.newOne":1}).observeChanges({//il faut restreindre l'observe
        changed: function(id,fields) {  
            //collection, id, fields
            var slide = Slides.find({
                _id: id
            });
            console.log("add pseudo slide", id,fields);
//          
            Slides.update({_id: pseudoSlideshowId, "sub1.newOne":1},{$set:{ "sub1.$.newOne":0}});
              self.added("slides", id, slide);
        }
    });
    
    return;

    //pour les modifications sur les slides
    //pour le test, on regarde que la slide juste crée (sera ensuite le slideshow)
    //et puis on met un observeChanges par slide


    var handle = Slides.find({_id: pseudoSlideshowId, "sub1._id": "id1"}, {fields: {"sub1.$": 1}}).observeChanges({//il faut restreindre l'observe  
        changed: function(id, fields) {
            console.log("id1: publishSlides.changed", id, fields);
        }
    });

    var handle = Slides.find({_id: pseudoSlideshowId, "sub1._id": "id2"}, {fields: {"sub1.$": 1}}).observeChanges({//il faut restreindre l'observe  
        changed: function(id, fields) {
            console.log("id2: publishSlides.changed", id, fields);
        }
    });


    return;
    /*
     changed: function(id, fields) {
     console.log("publishSlides.changed", id, fields);
     var slide = Slides.findOne({
     _id: id
     });
     self.changed("slides", id, slide); //mais on peut publish separement self.changed("slides",id,{top:slide.top});
     }
     */

    //////requete de test coté client

    //ajout de pseudo slide (ajout via push dans sub1 via push)
    Slides.update({_id: "CxqBw4c2oyDDoHkYr"},
    {$push: {
            sub1: {
                _id: "id3",
                attr1: "three",
                newOne : 1 //magouille degeulasse, flag pour dire au publish de l'ajouter
        
            }
        }
    }); 


    //modification d'une pseudo slide (
    Slides.update("CxqBw4c2oyDDoHkYr",
            {$set: {"sub1.0.attr1": "pouet5"}});




};

Meteor.methods({
    //ne sert à rien
    testUpdateSubDocument: function(id, str) {
//        console.log("meteor methods ",id,str);
        Slides.update({_id: id, "subDocument": "subSubDocument"},
        {$set:
                    {subSubAttr1: str}
        }
        );
    }
});


publishJmpressSlides = function() {
    return Slides.find({type: "jmpressSlide"});
};

publishPlaneSlides = function() {
    return Slides.find({type: "planeSlide"});
};

publishSlidesLock = function() {
    return SlidesLock.find({}); //plus tard, ne pas envoyer l'id mais l'email, ou null si null
};

if (Meteor.isServer) {

    Slides = new Meteor.Collection("slides");
    SlidesLock = new Meteor.Collection("slidesLock");

    //publication des données
    Meteor.publish('slides', publishSlides);
    Meteor.publish('planeSlides', publishPlaneSlides);
    Meteor.publish('jmpressSlides', publishJmpressSlides);
    Meteor.publish('slidesLock', publishSlidesLock);


    Meteor.startup(function() {
        // code to run on server at startup
        if (Slides.find().count() != 0) {
            Slides.remove();
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
        insert: function() {
            console.log("info : slides.allow.insert : true");
            return true;
        },
        update: function(userId, slide, fields, modifier) {
            return true;
            console.log("info : slides.allow.update");
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


