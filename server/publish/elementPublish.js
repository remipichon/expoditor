Elements = new Meteor.Collection("elements");



// when updating element, if slideReference is empty, delete element
Elements.after.update(function(userId, element, fields, modifier, options) {
    //slide reference, if empty : delete element
    if (_.contains(fields, 'slideReference')) {
        if (_.isEmpty(element.slideReference)) {
            logger.info("Elements.after.update : no more slide reference, element removed ", element._id);
            Elements.remove({
                _id: element._id
            });
        }

    }
});

Elements.after.remove(function(userId, element) {
    Locks.remove({
        componentId: element._id
    });
});


Elements.allow({
    insert: function(userId, element, fields, modifier) {
       // return true;
        //slideshow access controll
        var slide = Slides.findOne({
            _id: element.slideReference[0]
        });
        if (!SlideshowHelper.prototype.hasAccessSlideshow(slide.slideshowReference[0], userId))
            throw new Meteor.Error("24", "elements.insert : user has not access to slideshow ", lock.slide.slideshowReference);


        logger.info("info : Elements.allow.insert : true ", element._id,"in slide",slide._id);
        return true;
    },
    update: function(userId, element, fields, modifier) {
        logger.info("Elements.allow.update : ", element._id);

        var toReturn = false;

        //slideshow access controll
        var slide = Slides.findOne({
            _id: element.slideReference[0]
        });
        if (!SlideshowHelper.prototype.hasAccessSlideshow(slide.slideshowReference[0], userId))
            throw new Meteor.Error("24", "Elements.allow.update : user has not access to slideshow ", lock.slide.slideshowReference);



        //lock control
        if (!userHasAccessToComponent(element, fields)) {
            logger.log("Elements.allow.update : user does not have access to update fiels " + fields);
            throw new Meteor.Error("Elements.allow.update : user does not have access to update fiels " + fields);
        }

        //display options
        if (_.contains(fields, 'displayOptions')) {
            //position
            if (modifier.toString().indexOf("positions") !== -1) { //pas funky ca
                logger.info("Elements.allow.update : allow pos update on",element._id);
            }

            toReturn = true;
        }



        //content
        if (_.contains(fields, 'content')) {
            var lock = Locks.findOne({
                $and: [{
                    componentId: element._id
                }, {
                    'user.userId': userId
                }]
            });

            if (typeof lock == 'undefined') {
                logger.info("Elements.allow.update : client trying to update without lock element : ", element._id, "client :", userId);
                return false;
            }
            logger.info("Elements.allow.update : allow content update on",element._id);

            toReturn = true;
        }



        if (toReturn) {
            return true;
        }


        logger.info("Elements.allow.update : case not expected, return false on",element._id);
        return false;

    },
    remove: function(userId, element) {
        //slideshow access controll
        var slide = Slides.findOne({
            _id: element.slideReference[0]
        });
        if (!SlideshowHelper.prototype.hasAccessSlideshow(slide.slideshowReference[0], userId))
            throw new Meteor.Error("24", "Elements.remove : user has not access to slideshow ", lock.slide.slideshowReference);

        logger.info("Elements.allow.remove from slide", slide._id,"element._id",element._id);
        return true;
    }
});