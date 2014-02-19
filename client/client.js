


/*
le doublie click sur un elemen fire le double click sur la slide et avec du caca en plus 
dans la mesire ou le promp est vide et que le title est pas vraiment mis à jour
*/



  


var subscriptionSlide = Meteor.subscribe("slides");
//var subscriptionslidesWithElements = Meteor.subscribe("slidesWithElements");

Slides = new Meteor.Collection("slidesWithElements");

Template.slide.elements = function(){
    return this.elements;
};


Template.slideArea.slides = function() {
    return Slides.find({});
};

Template.element.rendered = function(){
    console.log("element.rendered",this.data._id);
}

Template.slide.rendered = function() {
    console.log("slide.rendered",this.data._id);
    self = this;
    var $slide = $(self.find(".slide"));
    var $slide = $("#" + this.data._id);
    $slide.draggable();
    return;


//    var left = self.data.left;
//    var top = self.data.top;
//    var ratio = 10;
//    console.log("render slide:", this.data._id, top, left);
//
//
//    //title
//    $slide.children('.title').html(self.data.title);
//
//    //pos
//    $slide.css("left", left).css("top", top);


};


Template.addElement.events({
    'click': function(event) {
        event.stopPropagation();
        var $element = $(event.target);
        createSlideElement($element.parent(".slide").attr("id"));
    }
});


//update element
Template.element.events({
    'click': function(event) {
        event.stopPropagation();
        var $element = $(event.target);
        updateSlideElement($element.parent().parent(".slide").attr("id"), this);
    }
});

Template.deleteElement.events({
    'click': function(event) {
        event.stopPropagation();
        var $element = $(event.target);
        deleteSlideElement($element.parent().parent(".slide").attr("id"), this);
    }
});

getIndexOfElement = function(slideId, elementId) {
    var allElements = Slides.findOne({_id: slideId}).elements;
    for (var i = 0; i < allElements.length; i++) {
        if (allElements[i]._id === elementId)
            return i;
    }
    return -1;
};


updateSlideElement = function(slideId, element) {
    console.log("update element ", element._id, " of slide ", slideId);
    var content = prompt("new title", element.content);

    if (content != null) {
        //cancel, pas d'update
        //obligé de passer par l'index afin d'éviter //Not permitted. Untrusted code may only update documents by ID. [403]
        var elementIndex = getIndexOfElement(slideId, element._id); //pas aussi simple, il faut extraire slide.id et le chercher dans les elements de .slides

        var query = {};                 // create an empty object
        query['elements.' + elementIndex + '.content'] = content;  // and then populate the variable key

        Slides.update(
                {_id: slideId},
        {
            $set: query  //attention, c'est un $set donc ca écrase tout ce qui est maché 
        }
        );
    }
};

deleteSlideElement = function(slideId, element) {
    console.log("delete element ", element._id, " of slide ", slideId);

    Slides.update(
            {_id: slideId},
    {
        $pull: {elements:
                    {_id: element._id}
        }
    }
    );

    return;

};

/* Exception from Deps afterFlush function: Error: Can't create second landmark in same brancj*/
/*https://github.com/meteor/meteor/issues/281#issuecomment-16191927*/
/*https://github.com/meteor/meteor/issues/281#issuecomment-28704924*/
Handlebars.registerHelper('labelBranch', function(label, options) {
    var data = this;
    return Spark.labelBranch(Spark.UNIQUE_LABEL, function() {
        return options.fn(data);
    });
});



createSlideElement = function(slideId) {
    var d = new Date;
    var title = "ele:" + d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
    console.log("create element on slide ", slideId);

    return Slides.update(
            {_id: slideId},
    {$push: {
            elements: {
                _id: Random.id(),
                type: "text",
                content: title
            }
        }
    }
    );
//        db.slidesWithElements.update(
//            {_id: "PnNRaQyCiz2J5Fv5D"},
//    {$push: {
//            elements: {
//                _id: "12341234",
//                type: "text",
//                content: "title"
//            }
//        }
//    }
//    );

};


//TODO
//delete el











//update title
Template.slide.events({
    'dblclick': function(event) {
        event.stopPropagation();
        //mise en place du lock si slide dispo
        console.log("update title slide canceled by events");
        return;
        updateSlideTitle(this);
    }
  
});



//update pos slide at the end of a move
Template.slide.events({
    'mouseup': function(event) {
//        event.stopPropagation();//jquery doit pouvoir recevoir l'event pour gerer comme il faut le draggable
        updateSlidePos(this, event);
    }
});


Template.deleteSlide.events({
    'click': function(event) {
        event.stopPropagation();
        event.stopPropagation();
        var self = this;
        Slides.remove(self._id);
    }
});







createSlide = function(options) {
    var d = new Date;
    var title = d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
    var top = 50;
    var left = 50;
    return  Slides.insert({
        title: title,
        top: top,
        left: left,
        type: "options.type",
        elements: [
            {
                _id: "id1",
                type: "text",
                content: "text1"
                        //mettre tous les attributs atomique à ce niveau
                        //pos est atomique car pos.x et pos.y sont màj en meme temps par un seul client
                        //content pour text est atomique, font l'est aussi si on peut permettre qu'un client modify the font while another edit text
            },
            {
                _id: "id1",
                type: "text",
                content: "text2"

            }
        ]
    });
};

updateSlideTitle = function(slide) {
    console.log("update title");
    var title = prompt("new title", slide.title);
    console.log("update title : remove lock of slide", slide._id);

    if (title != null) {
        //cancel, pas d'update
        Slides.update(slide._id, {$set:
                    {title: title}
        });
    }


};

updateSlidePos = function(slide, event) {
    var $slide = $("#" + slide._id);
    var top = parseInt($slide.css('top'));
    var left = parseInt($slide.css('left'));

    console.log("updateSlidePos :", left, top);

    return Slides.update(slide._id, {$set:
                {top: top, left: left}
    });
};





/** pour du debug sur le render **/
function logRenders () {
    _.each(Template, function (template, name) {
      var oldRender = template.rendered;
      var counter = 0;
 
      template.rendered = function () {
        console.log(name, "render count: ", ++counter);
        oldRender && oldRender.apply(this, arguments);
      };
    });
  }
  
//  logRenders();


