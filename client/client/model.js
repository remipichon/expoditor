/***********************
 * Manage locks
 *
 ***********************/


/*
 * set lock if component is free to edit
 * return true si lock successfuly added, false else
 */
updateWithLocksControler = function(field, callback) {
    if (typeof field !== "undefined" && typeof callback !== "function") {
        callback = field;
        field = null;
    }
    logger.info("updateWithLocksControler");

    var lock = Locks.findOne({
        componentId: this._id
    });
    var slideshowId = Slideshow.findOne({})._id;

    if (userHasAccessToComponent.call(this)) {
        var user = Meteor.user();

        if (typeof lock == 'undefined') {
            Locks.insert({
                slideshowId: slideshowId,
                componentId: this._id,
                user: {
                    userId: user._id,
                    username: user.username
                },
                properties: []
            });
        } else {
            Locks.update(
                lock._id, {
                    $set: {
                        user: {
                            userId: user._id,
                            username: user.username
                        },
                        type: 'title'
                    }
                });
        }
        logger.info("update component, add lock to component", this._id);
        if (typeof callback === "function")
            callback.call(this);
        return true;
    } else {
        if (typeof lock !== "undefined")
            alert("lock set by " + lock.user.username);
        else
            alert("you cannot edit this component");
        return false;
    }

};

removeLocksControler = function() {
    logger.info("removeLocksControler");
    var lock = Locks.findOne({
        componentId: this._id
    });
    if (typeof lock === "undefined")
        return;

    //supression du lock
    Locks.update(
        lock._id, {
            $set: {
                user: null
            }
        });
};



_clearServerData = function(str) {
    logger.info("_clearServerData");
    Meteor.call('_clearServerData', function(error, result) {
        logger.log("_clearServerData : server answered with ", result);
    });
};

_clearDynamiqueServerData = function(str) {
    logger.info("_clearDynamiqueServerData");
    Meteor.call('_clearDynamiqueServerData', function(error, result) {
        logger.log("_clearDynamiqueServerData : server answered with ", result);
    });
};

_unloadToStore = function(str) {
    logger.info("_unloadToStore");
    Meteor.call('_unloadToStore', str, function(error, result) {
        logger.log("_unloadToStore : server answered with ", result);
    });
};

_loadToEdit = function(str) {
    logger.info("_loadToEdit");
    Meteor.call('_loadToEdit', str, function(error, result) {
        logger.log("_loadToEdit : server answered with ", result);
    });
};

_getInfos = function(str) {
    logger.info("_getInfos");
    Meteor.call('_getInfos', str, function(error, result) {
        logger.log(error,result)
        slideshows = result.slideshows;
        slides = result.slides;
        elements = result.elements;
        locks = result.locks;
        slideshowPublished = result.slideshowPublished;

        logger.log("***get infos***")
        logger.log("nb slideshow :", slideshows);
        logger.log("nb slides :", slides);
        logger.log("nb elements :", elements);
        logger.log("nb locks :", locks);
        logger.log("slideshowPublished :", slideshowPublished);
         logger.log("***all are set in global variable***")
    });
};