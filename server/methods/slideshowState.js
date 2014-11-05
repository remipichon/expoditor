SlideshowState = function(){};


SlideshowState.prototype.unloadToStore = function(slideshowId) {

    delete slideshowPublished[slideshowId];

    var slideshow = Slideshow.findOne({
        _id: slideshowId
    });
    var slides = slideshow.slides;

    var slide, slideElements, nb;
    _.each(slides, function(slideId) {
        if (typeof slideId === 'object') {
            logger.info("SlideshowState.prototype.unloadToStore : error : the slide is already an object");
            return;
        }
        logger.info("SlideshowState.prototype.unloadToStore : slide ", slideId);
        


        //get all elements and the slide
        slideElements = Elements.find({
            slideReference: {
                $in: [slideId]
            } //get all elements which are linked to the slide
        }).fetch();
        slide = Slides.findOne({
            _id: slideId
        });

        var elementToStore = [];
        _.each(slideElements, function(element) {
            logger.info("SlideshowState.prototype.unloadToStore : element ", element._id);
            //add elements into the slide
            elementToStore.push(element);

            //purge collection.elements
            Elements.update(element._id, {
                $pull: {
                    slideReference: slideId
                }
            });
        });
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
    logger.info("SlideshowState.prototype.unloadToStore : done");
};


SlideshowState.prototype.loadToEdit = function(slideshowId) {
    var slideshow = Slideshow.findOne({
        _id: slideshowId
    });
    var slides = slideshow.slides;

    var slide, slideElements, nb;
    _.each(slides, function(slide) {
        logger.info("SlideshowState.prototype.loadToEdit : slide ", slide._id);

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
            logger.log("SlideshowState.prototype.loadToEdit : element", element._id);
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
    logger.log("SlideshowState.prototype.loadToEdit : done");

}



SlideshowState.prototype.recoverData = function(){
    Locks.remove({});
        //belov code is bad but it's not intended to be often use
        var slides = Slides.find({}).fetch();
        if (slides.length !== 0) {
            logger.warn("SlideshowState.prototype.recoverData : there is slides remaining in slides collection (must be empty, something bad appends last shutdown");
            logger.info("SlideshowState.prototype.recoverData : trying to recover data...");
            var slideshowId;
            var nbShittySlide = slides.length;

            while (slides.length !== 0) {
                slideshowId = slides[0].slideshowReference[0]; //get first slideshow of the first remaining slide
                logger.info("SlideshowState.prototype.recoverData : trying to recover data for slideshow ", slideshowId);
                 SlideshowState.prototype.unloadToStore(slideshowId);
                if (--nbShittySlide === 0) {
                    logger.info("SlideshowState.prototype.recoverData : recovering didn't success completely, remaining slides are deleted...");
                    Slides.remove({});
                    break;
                }
                slides = Slides.find({}).fetch();


            }
            var l = Elements.find({}).fetch().length;
            if (l !== 0) {
                logger.warn("SlideshowState.prototype.recoverData : there is -", l, "- elements remaining in elements collection (must be empty, something bad appends last shutdonw");
                logger.info("SlideshowState.prototype.recoverData : remaining elements are deleted...");
                Elements.remove({});
            }

        }
}