
unloadToStore = function(slideshowId) {
    logger.log("unloadToStore ", slideshowId);

    delete slideshowPublished[slideshowId];

    var slideshow = Slideshow.findOne({
        _id: slideshowId
    });
    var slides = slideshow.slides;

    var slide, slideElements, nb;
    _.each(slides, function(slideId) {
        logger.log("unloadToStore slide ", slideId);
        if (typeof slideId === 'object') {
            logger.log("unloadToStore : error : a slide is already an object");
            return;
        }


        //get all elements and the slide
        slideElements = Elements.find({
            slideReference: {
                $in: [slideId]
            } //get all elements which are linked to the slide
        }).fetch();
        slide = Slides.findOne({
            _id: slideId
        });

        logger.log("unloadToStore elements ", slideElements);
        var elementToStore = [];
        _.each(slideElements, function(element) {
            logger.log("unloadToStore element ", element._id);
            //add elements into the slide
            elementToStore.push(element);

            //purge collection.elements
            Elements.update(element._id, {
                $pull: {
                    slideReference: slideId
                }
            });
        });
        logger.log("unloadToStore elementToStore ", elementToStore.length);
        //add elements into the slide
        nb = Slides.update(slideId, {
            $set: {
                elements: elementToStore
            }
        });

        slide = Slides.findOne({
            _id: slideId
        });

        //add the slide into slideshow
        Slideshow.update(slideshowId, {
            $push: {
                slides: slide
            }
        });
        Slideshow.update(slideshowId, {
            $pull: {
                slides: slideId
            }
        });

        //purge collection.slides
        Slides.remove({
            _id: slideId
        });

    });
    logger.log("unloadToStore done");
};


loadToEdit = function(slideshowId) {
    logger.log("loadToEdit ", slideshowId);
    var slideshow = Slideshow.findOne({
        _id: slideshowId
    });
    var slides = slideshow.slides;

    var slide, slideElements, nb;
    _.each(slides, function(slide) {
        logger.log("loadToEdit slide ", slide._id);

        // insert slide in collection.slides
        Slides.insert(slide);

        // replace slide by its id in slideshow.slide
        Slideshow.update(slideshowId, {
            $pull: {
                slides: slide
            }
        });
        Slideshow.update(slideshowId, {
            $pull: {
                slides: slide._id
            }
        });
        Slideshow.update(slideshowId, {
            $push: {
                slides: slide._id
            }
        });

        // foreach element in slide.element
        _.each(slide.elements, function(element) {
            logger.log("loadToEdit element", element._id);
            //  if element already in collection.elements
            if (typeof Elements.findOne({
                _id: element._id
            }) !== 'undefined') {
                //      add slide reference in element.slideReferences
                //      ==> déja le cas avant le unload donc c'est bon
            } else {
                Elements.insert(element);
                //      insert element in collection.elements

            }
        })
        // remove slide.element
        Slides.update(slide._id, {
            $set: {
                elements: []
            }
        })


    });
    logger.log("loadToEdit done");

}



recoverData = function(){
    Locks.remove({});
        //belov code is bad but it's not intended to be often use
        var slides = Slides.find({}).fetch();
        if (slides.length !== 0) {
            logger.log("warning : startup : there is slides remaining in slides collection (must be empty, something bad appends last shutdown");
            logger.log("infos : startup : trying to recover data...");
            var slideshowId;
            var nbShittySlide = slides.length;

            while (slides.length !== 0) {
                slideshowId = slides[0].slideshowReference[0]; //get first slideshow of the first remaining slide
                logger.log("infos : startup : trying to recover data for slideshow ", slideshowId);
                unloadToStore(slideshowId);
                if (--nbShittySlide === 0) {
                    logger.log("infos : startup : recovering didn't success completely, remaining slides are deleted...");
                    Slides.remove({});
                    break;
                }
                slides = Slides.find({}).fetch();


            }
            var l = Elements.find({}).fetch().length;
            if (l !== 0) {
                logger.log("warning : startup : there is -", l, "- elements remaining in elements collection (must be empty, something bad appends last shutdonw");
                logger.log("infos : startup : remaining elements are deleted...");
                Elements.remove({});
            }

        }
}