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
userHasAccessToComponent = function(property) {
    var userId = Meteor.userId();
    var lock = Locks.findOne({componentId: this._id});
    if (typeof lock == 'undefined' || lock.user === null || lock.user.userId == Meteor.userId() )
        return true;
    
     //lock are not be set by user
    if ( typeof property === "undefined")//on veut tout
        return false;
    else {
        if (lock.properties.toString().indexOf(property) === -1)
            return true;
        else
            return false;
    }

};
        