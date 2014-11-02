Locks = new Meteor.Collection("lock");

Locks.allow({
    insert: function(userId, lock, fields, modifier) {
        return true;


        //check slideshow
        if (typeof lock.slideshowId === "undefined")
            throw new Meteor.Error("24", "lock.insert : lock does not contain a slideshowId");
        if (!SlideshowHelper.prototype.hasAccessSlideshow(lock.slideshowId, userId))
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

        //check properties
        if (typeof lock.properties === "undefined" || !Array.isArray(lock.properties))
            throw new Meteor.Error("24", "lock.insert : lock does not contain a properties array");


        logger.info("Locks.allow.insert : allow user",userId,"on component",lock.componentId,"with properties",lock.properties);
        return true;
    },
    update: function(userId, newLock, fields, modifier) {
        return true;



        //verifie si le lock existe bel et bien
        var lock = Locks.findOne({
            _id: newLock._id
        });
        if (typeof lock == 'undefined') {
            throw new Meteor.Error("24", "Lock.allow.update : lock doesn't exist ", newLock._id);
            return false;
        }

        //si ajout d'un lock
        if (modifier.$set.user != null) {
            //verification que le lock n'écrase pas un lock
            if (lock.user != null) {
                logger.info("Lock.allow.update : a lock is already set : db : ", lock._id, "new : ", newLock._id);
                return false;
            }
            logger.info("Lock.allow.update : add lock OK");
            return true;
        }

        //si suppresion d'un lock
        if (userId != lock.user.userId) {
            //verification que le lock est bien celui du user
            logger.info("SlidesLock.update : client try to remove a lock not set by him : robber ", userId, " locker : ", lock.user.userId);
            return false;
        } else {
            logger.info("SlidesLock.update : remove lock OK");
            return true;
        }

        logger.info("SlidesLock.update : case not expected, return false");
        return false;
    },
    remove: function() {
        return true;


        
        return false;
    }
});
