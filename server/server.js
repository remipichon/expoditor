//
//publishSlidesWithElements = function(){
//    return Slides.find({});
//};

publishSlides = function() {
    var self = this;

    //il faut stop le handle oiu fiare d'autres trucs je sais plus quoi
    var handleSlides = Slides.find({}).observeChanges({
        added: function(id, slide) {
            console.log("added", id);
            self.added("slidesWithElements", id, slide);
            
            //gestion de l'array elements de chaque slide
            var handleElementsBySlides = Slides.find({_id: id},{fields:{elements:1}}).observeChanges({
               changed: function(id,fields){
                   console.log("elements changed for slide",id);
                   self.changed("slidesWithElements", id, fields);
               }
            }); 
        },
        changed: function(id, fields) {            
            if( typeof fields.elements !== "undefined"){
//                console.log("elements changed (add/update/remove)");
                return;
            }
            console.log("changed", id,fields);
            self.changed("slidesWithElements", id, fields);
        },
        removed: function(id, slide) {
            console.log("removed", id);
            self.removed("slidesWithElements", id, slide);
        }
    });
};

publishSlides2 = function() {

    return Slides.find({});

    pseudoSlideshowId = "!!!!!!!!!!!!!!";

    var self = this;

    var slide = Slides.findOne({
        _id: pseudoSlideshowId
    });

    self.added("slides", pseudoSlideshowId, slide);


    //pour ajouter une slide, on ne regarde que l'attribut slide (sub1) (ne prend pas en compte la structure complexe)
    var handle = Slides.find({_id: pseudoSlideshowId, "sub1.newOne": 1}).observeChanges({//il faut restreindre l'observe
        changed: function(id, fields) {
            //collection, id, fields
            var slide = Slides.find({
                _id: id
            });
            console.log("add pseudo slide", id, fields);
//          
            Slides.update({_id: pseudoSlideshowId, "sub1.newOne": 1}, {$set: {"sub1.$.newOne": 0}});
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
                newOne: 1 //magouille degeulasse, flag pour dire au publish de l'ajouter

            }
        }
    });


    //modification d'une pseudo slide (
    Slides.update("CxqBw4c2oyDDoHkYr",
            {$set: {"sub1.0.attr1": "pouet5"}});




};


Meteor.publish("slides", publishSlides);
//Meteor.publish("slidesWithElements", publishSlidesWithElements);

Slides = new Meteor.Collection("slidesWithElements");








