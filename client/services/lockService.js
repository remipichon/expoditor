LockService = function() {};




/*
 * set lock if component is free to edit
 * return true si lock successfuly added, false else
 */
/**
 * ["all"]
 */


LockService.prototype.setLock = function(componentId, fieldsList) {
    if (typeof componentId !== "string") {
        logger.error("LockService.setLock : param componentId is required as a string");
        throw new Meteor.Error("500","LockService.setLock : param componentId is required as a string");
    }
    if (!Array.isArray(fieldsList)) {
        logger.error("LockService.setLock : param fields is required as an array");
        throw new Meteor.Error("500","LockService.setLock : param fields is required as an array");
    }

    var lock = Locks.findOne({
        componentId: componentId
    });
    var slideshowId = Slideshow.findOne({})._id;

    if (userHasAccessToComponent(componentId, fieldsList)) {
        var MUser = Meteor.user();

        var user = {
            userId: MUser._id,
            username: MUser.username
        };

        if (typeof lock === 'undefined') {
            var fields = {}; //object fieldName : user
            for (var i = 0; i < fieldsList.length; i++) {
                fields[fieldsList[i]] = user;
            }
            Locks.insert({
                slideshowId: slideshowId,
                componentId: componentId,
                fields: fields
            });
        } else {
            var updatedField = {};
            for (var i = 0; i < fieldsList.length; i++) {
                updatedField["fields." + fieldsList[i]] = user;
            }

            Locks.update(
                lock._id, {
                    $set: updatedField
                });
        }
        logger.info("update component, add lock to component", componentId);
        return true;
    } else {
        if (typeof lock !== "undefined") {
            var annoyingUser = "";
            for (var i = 0; i < fieldsList.length; i++) {
                var field = fieldsList[i];
                annoyingUser += "on field '"+field+"'' by '"+ lock.fields[field].username + "'\n";
            }
            alert("Some locks are set \n" + annoyingUser); //TODO prendre en compte le multi field
        } else
            alert("you cannot edit this component");
        return false;
    }

};

LockService.prototype.unsetLock = function(componentId, fieldsList) {
    if (typeof componentId !== "string") {
        logger.error("LockService.setLock : param componentId is required as a string");
    }
    if (!Array.isArray(fieldsList)) {
        logger.error("LockService.setLock : param fields is required as an array");
    }


    if (userHasAccessToComponent(componentId, fieldsList)) {

        var lock = Locks.findOne({
            componentId: componentId
        });
        if (typeof lock === "undefined")
            return -1;

        var MUser = Meteor.user();

        var user = {
            userId: MUser._id,
            username: MUser.username
        };

        var deletedField = {};
        for (var i = 0; i < fieldsList.length; i++) {
            deletedField["fields." + fieldsList[i]] = user;
        }

        return Locks.update(
            lock._id, {
                $unset: deletedField
            });
    }

    logger.trace("LockService.unsetLock",
        "user", Meteor.user()._id, "has lost access on component", componentId, "when unlocking fields", fieldsList);
    throw new Meteor.Error(404, "user " + Meteor.user()._id + " has lost access on component " + componentId + " when unlocking fields " + fieldsList);
};

