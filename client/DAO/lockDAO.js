LockDAO = function(){};



/*
 * set lock if component is free to edit
 * return true si lock successfuly added, false else
 */
LockDAO.prototype.updateWithLocksControler = function(field, callback) {
    if (typeof field !== "undefined" && typeof callback !== "function") {
        callback = field;
        field = null;
    }
  
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

LockDAO.prototype.removeLocksControler = function() {
   var lock = Locks.findOne({
        componentId: this._id
    });
    if (typeof lock === "undefined")
        return;

    //supression du lock
    return Locks.update(
        lock._id, {
            $set: {
                user: null
            }
        });
};
