Elements = new Meteor.Collection("elements");



// when updating element, if slideReference is empty, delete element
Elements.after.update(function(userId, element, fields, modifier, options) {
    logger.log("elements.update.after");
    //slide reference, if empty : delete element
    if (_.contains(fields, 'slideReference')) {
        if (_.isEmpty(element.slideReference)) {
            logger.log("element removed ", element._id);
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
        return true;
        //slideshow access controll
        var slide = Slides.findOne({
            _id: element.slideReference[0]
        });
        logger.log("info : elements.allow.insert : slide", slide._id);
        if (!hasAccessSlideshow(slide.slideshowReference[0], userId))
            throw new Meteor.Error("24", "elements.insert : user has not access to slideshow ", lock.slide.slideshowReference);


        logger.log("info : elements.allow.insert : true ", element);
        return true;
    },
    update: function(userId, element, fields, modifier) {
        return true;
        logger.log("elements.allow.update : ", element._id);

        var toReturn = false;

        //slideshow access controll
        var slide = Slides.findOne({
            _id: element.slideReference[0]
        });
        logger.log("info : elements.allow.insert : slide", slide._id);
        if (!hasAccessSlideshow(slide.slideshowReference[0], userId))
            throw new Meteor.Error("24", "elements.insert : user has not access to slideshow ", lock.slide.slideshowReference);



        //lock control
        if (!userHasAccessToComponent(element, fields)) {
            logger.log("elements.allow.update : user does not have access to update fiels " + fields);
            throw new Meteor.Error("elements.allow.update : user does not have access to update fiels " + fields);
        }

        //display options
        if (_.contains(fields, 'displayOptions')) {
            //position
            if (modifier.toString().indexOf("positions") !== -1) { //pas funky ca
                var position = element.displayOptions.jmpress.positions;
                logger.log("elements.allow.update.pos : ", position, " _id : ", element._id);
            }

            toReturn = true;
        }



        //content
        if (_.contains(fields, 'content')) {
            //            if (modifier.toString().indexOf("title") !== -1) { //pas funky ca
            logger.log("elements.allow.update elementId", element._id);
            var lock = Locks.findOne({
                $and: [{
                    componentId: element._id
                }, {
                    'user.userId': userId
                }]
            });
            logger.log("elements.allow.updat lock", lock);
            if (typeof lock == 'undefined') {
                logger.log("info : elements.allow.update : client trying to update without lock element : ", element._id, "client :", userId);
                return false;
            }
            logger.log("info : elements.allow.update : allow content update");

            toReturn = true;
        }



        if (toReturn) {
            return true;
        }


        logger.log("info : elementsLock.allow.update pos : case not expected, return false");
        return false;

    },
    remove: function(userId, element) {
        return true;
        //slideshow access controll
        var slide = Slides.findOne({
            _id: element.slideReference[0]
        });
        logger.log("info : elements.allow.insert : slide", slide._id);
        if (!hasAccessSlideshow(slide.slideshowReference[0], userId))
            throw new Meteor.Error("24", "elements.insert : user has not access to slideshow ", lock.slide.slideshowReference);


        return true;
    }
});