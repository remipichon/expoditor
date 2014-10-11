



Meteor.methods({
    clearServerData: function() {
        logger.log("dev : clear all db's data");
        Slideshow.remove({});
        Slides.remove({});
        Elements.remove({});
        Locks.remove({});
        slideshowPublished = {};
    },

    clearDynamiqueServerData: function() {
        logger.log("dev : clear dynamique server data");
        Locks.remove({});
        slideshowPublished = {};
    },

    unloadToStore: function(slideshowId) {
        logger.log("dev : _unloadToStore",slideshowId);
         SlideshowState.prototype.unloadToStore(slideshowId);
    },

    loadToEdit: function(slideshowId) {
        logger.log("dev : _loadToEdit",slideshowId);
        loadToEdit(slideshowId);
    },

    getInfos: function() {
        var slideshows = Slideshow.find({}).fetch();
        var slides = Slides.find({}).fetch();
        var elements = Elements.find({}).fetch();
        var locks = Locks.find({}).fetch();
        return {
            slideshows: slideshows.length,
            slides: slides.length,
            elements: elements.length,
            locks: locks.length,
            slideshowPublished: slideshowPublished,

        }
    }

});