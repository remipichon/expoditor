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
    console.info("updateWithLocksControler");

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
                    emails: user.emails[0].address
                },
                properties: []
            });
        } else {
            Locks.update(
                lock._id, {
                    $set: {
                        user: {
                            userId: user._id,
                            emails: user.emails[0].address
                        },
                        type: 'title'
                    }
                });
        }
        console.info("update component, add lock to component", this._id);
        if (typeof callback === "function")
            callback.call(this);
        return true;
    } else {
        if (typeof lock !== "undefined")
            alert("lock set by " + lock.user.emails);
        else
            alert("you cannot edit this component");
        return false;
    }

};

removeLocksControler = function() {
    console.info("removeLocksControler");
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
    console.info("_clearServerData");
    Meteor.call('_clearServerData', function(error, result) {
        console.log("_clearServerData : server answered with ", result);
    });
};

_clearDynamiqueServerData = function(str) {
    console.info("_clearDynamiqueServerData");
    Meteor.call('_clearDynamiqueServerData', function(error, result) {
        console.log("_clearDynamiqueServerData : server answered with ", result);
    });
};

_unloadToStore = function(str) {
    console.info("_unloadToStore");
    Meteor.call('_unloadToStore', str, function(error, result) {
        console.log("_unloadToStore : server answered with ", result);
    });
};

_loadToEdit = function(str) {
    console.info("_loadToEdit");
    Meteor.call('_loadToEdit', str, function(error, result) {
        console.log("_loadToEdit : server answered with ", result);
    });
};

_getInfos = function(str) {
    console.info("_getInfos");
    Meteor.call('_getInfos', str, function(error, result) {
        console.log(error,result)
        slideshows = result.slideshows;
        slides = result.slides;
        elements = result.elements;
        locks = result.locks;
        slideshowPublished = result.slideshowPublished;

        console.log("***get infos***")
        console.log("nb slideshow :", slideshows);
        console.log("nb slides :", slides);
        console.log("nb elements :", elements);
        console.log("nb locks :", locks);
        console.log("slideshowPublished :", slideshowPublished);
         console.log("***all are set in global variable***")
    });
};