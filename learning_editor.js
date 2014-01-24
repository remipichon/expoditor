



Slides = new Meteor.Collection("slides");
SlidesLock = new Meteor.Collection("slidesLock");



if (Meteor.isClient) {

    Meteor.startup(function() {
        // code to run on server at startup
        //attribution d'un ID, plus tard ce sera le serveur qui le communiquera
        Session.set("userId", Random.id());
    });





    //code executed on load
    Template.hello.greeeting = function() {
        return "Welcome to learning_editor.";
    };

    //create a slide
    Template.hello.events({
        'click input': function() {
            var d = new Date;
            var title = d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
            createSlide({title: title});
        }
    });

    //init slideArea with all slides presents in db
    Template.slideArea.slides = function() {
        return Slides.find({});
    };

    //callback of render to add draggable and fadeInt when first render
    Template.slide.rendered = function() {
        //console.log("slide rendered");
        var self = this;
        $(self.find(".slide")).draggable();
        if (self.data.toFadeIn) { //pour ne fadeIn qu'une fois
            $("#" + self.data._id).fadeOut(0).fadeIn(1000);  //petite magouille
            self.data.toFadeIn = false;
        }

        var left = self.data.left;
        var top = self.data.top;
        $(self.find(".slide")).css("left", left).css("top", top);
        // BAD BAD BAD BAD BAD il faut trouver un moyen pour que ce soit meteor qui s'en charge ! 
        $(self.find(".slide")).children('.title').html(self.data.title);

//      


//      
    };

    //petite magouille in order to fadeInt when create only
    Template.slide.created = function() {
        this.data.toFadeIn = true;
    };

    //update title
    Template.slide.events({
        'dblclick': function() {
            //mise en place du lock si slide dispo
            var userId = Session.get("userId");
            var lock = SlidesLock.findOne({slideId: this._id});
            console.log("dblclick title :", lock, this._id);
            if (typeof lock == 'undefined' || lock.userId == null) {
                if (typeof lock == 'undefined') {
                    console.log("insert a lock");
                    SlidesLock.insert({slideId: this._id, userId: userId, type: 'title', slideTitle: this.title});
                } else {
                    console.log("lock.userId", lock.userId);
                    console.log("update a lock");
                    SlidesLock.update(
                            SlidesLock.findOne({slideId: this._id})._id,
                            {$set: {
                                    userId: userId, type: 'title', slideTitle: this.title //, slideId: this._id
                                }});
                }
                console.log("update title, add lock to slide", this._id);
                updateSlideTitle(this);
            } else {
                alert("lock set by " + lock.userId);
            }



        }
    });

    //try: update pos on move
    Template.slide.events({
        'mousedown, mousemove': function(event) {
            updateSlidePosMove(this, event);
        }
    });

    //update pos slide at the end of a move
    Template.slide.events({
        'mouseup': function(event) {
            updateSlidePos(this, event);
        }
    });

    //try : catch delete to add fadeOut (doen't work on others clients)
    Template.deleteSlide.events({
        'click': function(event) {
            event.stopPropagation();
            var self = this;
            $("#" + this._id).fadeOut(1000, function() {
                console.log("delete slide");
                Slides.remove(self._id);
            });
        }
    });
}


if (Meteor.isServer) {

    //Slides = new Meteor.Collection("slides");
    Meteor.startup(function() {
        // code to run on server at startup
        if (Slides.find().count() != 0) {
            Slides.remove();
        }
    });

    SlidesLock.allow({
        insert: function(userId, lock, fields, modifier) {
            //verifier si effectivement le client insert une slide qui n'existe pas encore
            //dans le lock. a voir si mongodb s'en charge pas déja
            return true;
        },
        update: function(userId, newLock, fields, modifier) {
            
            //pas encore testé
            return true; 
            
            
            
            console.log("debug : slidesLock.update ",modifier);

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
            } else{
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


    //le server empeche certaines actions sur les slides
    Slides.allow({
        insert: function() {
            return true;
        },
        update: function(userId, slide, fields, modifier) {
            
            //si c'est du texte, est ce que userId a mit un lock sur la slide en question
            if( _.contains(fields,'title') ){
                //userId has a lock ?
                 var lock = SlidesLock.findOne({$and: 
                             {slideId: slide.slideId, userId: userId}
                 });
                 if (typeof lock == 'undefined'){
                     console.log("info : slides.allow.update : client trying to update without lock slide : ",slide._id, "client :",userId);
                     return false;
                 }
                 //verif de la position si besoin
            }
    
            
            //add test si besoin de verifier position !
    
    
            //console.log("modifier",modifier,"fields",fields);
            var topSlide = parseInt(modifier.$set.top);//parseInt(slide.top);
            var leftSlide = parseInt(modifier.$set.left);//parseInt(slide.left);
            var widthSlide = 150;
            var heightSlide = 30;
            var widthForbidenZone = 200;
            var heightForbidenZone = 200;
            var topForbidenZone = 200;
            var leftForbidenZone = 200;
//            console.log("allow update server", topSlide, leftSlide);

            //si la mise à jour de la position proposée est dans la zone, on refuse l'update
            if (
                    (topForbidenZone < topSlide && topSlide < topForbidenZone + heightForbidenZone ||
                            topForbidenZone < topSlide + heightSlide && topSlide + heightSlide < topForbidenZone + heightForbidenZone)
                    &&
                    (leftForbidenZone < leftSlide && leftSlide < leftForbidenZone + widthForbidenZone ||
                            leftForbidenZone < leftSlide + widthSlide && leftSlide + widthSlide < leftForbidenZone + widthForbidenZone)
                    ) {
//                console.log("forbiden zone");

                return false;
            }

//            console.log("accepted");
            return true;
        },
        remove: function() {
            return true;
        }
    });
}


createSlide = function(options) {
    return  Slides.insert({title: options.title, top: "50px", left: "50px"});
};

updateSlideTitle = function(slide) {
    console.log("update title");
    var title = prompt("new title", slide.title);
    console.log("update title : remove lock of slide", slide._id);
    SlidesLock.update(
            SlidesLock.findOne({slideId: slide._id})._id,
            {$set:
                        {userId: null}
            });
    if (title == null)
        return; //cancel, pas d'update        
    return Slides.update(slide._id, {$set:
                {title: title}
    });
};

updateSlidePos = function(slide, event) {
    //console.log("update...");
    var $slide = $("#" + slide._id);
    var top = $slide.css('top');
    var left = $slide.css('left');
    //console.log('pos updating', top, left);

    return Slides.update(slide._id, {$set:
                {top: top, left: left}
    });
};


updateSlidePosMove = function(slide, event) {
    // return;  //try
    var $slide = $("#" + slide._id);
    var newTop = parseInt($slide.css('top'));
    var newLeft = parseInt($slide.css('left'));


    //histoire de pas trop surcharger le server, on update pas tout le temps
    var slideDb = Slides.findOne({_id: slide._id});
    var oldTop = parseInt(slideDb.top);
    var oldLeft = parseInt(slideDb.left);
    //console.log("newTop",newTop,"oldTop",oldTop);

    var distance = Math.sqrt(
            Math.pow(newTop - oldTop, 2) + Math.pow(newLeft - oldLeft, 2)
            );

    //trop courte
    if (distance < 5) {
        //console.log("skip update",distance);
        return;
    }




    // Deps.nonreactive(function() {
    Slides.update(slide._id, {$set:
                {top: newTop, left: newLeft}
    });
    //});
};







