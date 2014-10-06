Locks = new Meteor.Collection("lock");

Locks.allow({
    insert: function(userId, lock, fields, modifier) {
        //check slideshow
        if (typeof lock.slideshowId === "undefined")
            throw new Meteor.Error("24", "lock.insert : lock does not contain a slideshowId");
        if (!hasAccessSlideshow(lock.slideshowId, userId))
            throw new Meteor.Error("24", "lock.insert : user has not access to slideshow ", lock.slideshowId);


        //check component
        if (typeof lock.componentId === "undefined")
            throw new Meteor.Error("24", "lock.insert : lock does not contain a componentId");
        if (Locks.findOne({
            componentId: lock.componentId
        }))
            throw new Meteor.Error("24", "lock.insert : a lock already exists for the component ", lock.componentId);

        //check userId
        if (typeof lock.user.userId === "undefined")
            throw new Meteor.Error("24", "lock.insert : lock does not contain a userId");
        if (userId !== lock.user.userId)
            throw new Meteor.Error("24", "lock.insert : lock's userId ", lock.userId, " does not correspond to client's userId ", userId);

        //check userId
        if (typeof lock.properties === "undefined" || !Array.isArray(lock.properties))
            throw new Meteor.Error("24", "lock.insert : lock does not contain a properties array");


        logger.log("infos : Locks.allow : insert : true");
        return true;
    },
    update: function(userId, newLock, fields, modifier) {
        logger.log("infos : slidesLock.update ", modifier);

        //verifie si le lock existe bel et bien
        var lock = Locks.findOne({
            _id: newLock._id
        });
        if (typeof lock == 'undefined') {
            logger.log("info : lock.update : lock doesn't exist ", newLock._id);
            throw new Meteor.Error("24", "lock.update : lock doesn't exist ", newLock._id);
            return false;
        }

        //si ajout d'un lock
        if (modifier.$set.user != null) {
            //verification que le lock n'écrase pas un lock
            if (lock.user != null) {
                logger.log("info : lock.update : a lock is already set : db : ", lock._id, "new : ", newLock._id);
                return falsel;
            }
            logger.log("info : lock.update : add lock OK");
            return true;
        }

        //si suppresion d'un lock
        if (userId != lock.user.userId) {
            //verification que le lock est bien celui du user
            logger.log("info : slidesLock.update : client try to remove a lock not set by him : robber ", userId, " locker : ", lock.user.userId);
            return false;
        } else {
            logger.log("info : slidesLock.update : remove lock OK");
            return true;
        }

        logger.log("info : slidesLock.update : case not expected, return false");
        return false;
    },
    remove: function() {
        return false;
    }
});
