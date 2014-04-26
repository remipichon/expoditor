
/*
 * set lock if component is free to edit
 * return true si lock successfuly added, false else
 */
updateWithLocksControler = function(field, callback) {
    if (typeof field !== "undefined" && typeof callback !== "function") {
        callback = field;
        field = null;
    }
    console.log("updateWithLocksControler");

    var lock = Locks.findOne({
        componentId: this._id
    });
    var slideshowId = Slideshow.findOne({})._id;

    if (userHasAccessToComponent.call(this)) {
        var userId = Meteor.userId();

        if (typeof lock == 'undefined') {
            Locks.insert({
                slideshowId: slideshowId,
                componentId: this._id,
                userId: userId,
                properties: []
            });
        } else {
            Locks.update(
                lock._id, {
                    $set: {
                        userId: userId,
                        type: 'title'
                    }
                });
        }
        console.log("update component, add lock to component", this._id);
        if (typeof callback === "function")
            callback(this);
        return true;
    } else {
        if (typeof lock !== "undefined")
            alert("lock set by " + lock.userId);
        else
            alert("you cannot edit this component");
        return false;
    }

};

removeLocksControler = function() {
    var lock = Locks.findOne({
        componentId: this._id
    });
    if (typeof lock === "undefined")
        return;

    //supression du lock
    Locks.update(
        lock._id, {
            $set: {
                userId: null
            }
        });
};









clearServerData = function(str) {
    console.log("clearServerData");
    Meteor.call('clearServerData', function(error, result) {
        console.log("clearServerData : server answered with ", result);
    });
};




