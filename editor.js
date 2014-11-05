/*
 * S'il y a un lock pas mit par le user, on regarde si la property à modifier
 * fait parti des properties lockées (un array vide signifie que toutes les
 * properties du component sont lockées)
 *
 * @param {document mongoDB} this
 * @param {string} property : si non renseigné, on veut les accès à toutes les
 * properties du component
 * @returns {Boolean}
 */
userHasAccessToComponent = function(conponentId, fieldsList) {
    logger.info("userHasAccessToComponent", fieldsList);
    var userId = Meteor.userId();
    var lock = Locks.findOne({
        componentId: conponentId
    });
    if (typeof lock == 'undefined') //easy case, no locks
        return true;

    //check all field
    if (fieldsList[0] === "all" || fieldsList[0].length === 0 || typeof fieldsList === "undefined") {
        for (var i = 0; i < Object.keys(lock.fields).length; i++) {
            var field = Object.keys(lock.fields)[i];
            console.debug("userHasAcces : ", field);
            if (lock.fields[field] !== null) {
                if (lock.fields[field].userId === Meteor.userId()) {
                    continue;
                }
                logger.error("userHasAccessToComponent", "componentId can't be lock with 'all'");
                return false;
            }

        }
    }

    //check is all fieldsList is locked by the user
    for (var i = 0; i < fieldsList.length; i++) {
        var field = fieldsList[i];
        //is there a lock on field
        if (typeof lock.fields[field] !== "undefined") {
            //is it a lock set by userId
            if (lock.fields[field].userId === userId)
                continue;
            logger.error("userHasAccessToComponent", "componentId can't be lock with",fieldsList);
            return false;
        }
    }

    return true;

};