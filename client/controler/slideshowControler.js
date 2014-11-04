/**
 * Controler & Model pour slideshow
 *
 * Ce controler risque fort de disparaitre ou d'être migré sur la partie Expo
 *
 * (d'où son incohérence avec le reste de Editor, pour le moment)
 */



SlideshowControler = function(){};

SlideshowControler.prototype.create = function(callbackReturn) {
    if (typeof callbackReturn === "number") { //is it the callback ?
        if (callbackReturn !== 1) { //there was an error
            alert("an error occured when creating slideshow : " + callbackReturn.reason);
        } else {
            alert("slideshow successfully created");
        }
        return;
    }

    var title = prompt("Type a title for the new slideshow");
    if (title !== null) {
        slideshowControler.createSlideshowModel({
            title: title
        }, slideshowControler.create);
    }


};

SlideshowControler.prototype.createSlideshowModel = function(options, callback) {
    Meteor.call('createSlideshow', options, function(error, result) {
        if (typeof error !== "undefined") {
            logger.error("createSlideshow : create error ", error);
            callback(error);
        } else {
            logger.info("createSlideshow ", result);
            slideshowControler.getSlideshowModel({
                title: options.title,
            });
            callback(1);
        }
    });
};


SlideshowControler.prototype.update = function() {
    var title = Slideshow.findOne({}).informations.title;
    title = prompt("Enter a new title for slideshow \n(you also can dblClick on title to edit)", title);
    if (!title) return;
    updateSlideshowModel({
        title: title
    });
};


SlideshowControler.prototype.updateSlideshowModel = function(options) {
    if (typeof options.title === "undefined") {
        logger.warnig("updateSlideshow : title undefined");
        return;
    }

    Meteor.call('updateSlideshow', options, Slideshow.findOne({})._id, Meteor.userId(), function(error, result) {
        if (typeof error !== "undefined") {
            logger.error(" updateSlideshow : update error ", error);
        } else {
            logger.info("updateSlideshow : done");
        }
    });
};

SlideshowControler.prototype.delete = function() {
    var title = Slideshow.findOne().informations.title;
    var answ = confirm("Do you really want to delete all slideshow " + title + " ? It will affect all users, you should'nt do that...");
    if (answ) {
        slideshowControler.deleteSlideshowModel();
    }
};


SlideshowControler.prototype.deleteSlideshowModel = function() {
    Meteor.call('removeSlideshow', Slideshow.findOne({})._id, Meteor.userId(), function(error, result) {
        if (typeof error !== "undefined") {
            logger.error("removeSlideshow : remove error ", error);
        } else {
            logger.info("removeSlideshow : stop all corresponding subscriptions");
            //arret de la precedente si existante
            if (subscriptionSlideshow !== null)
                subscriptionSlideshow.stop();

        }
    });
};



SlideshowControler.prototype.getList = function(callback) {
    if (typeof callback !== "function")
        callback = logger.info;

    Meteor.call('getSlideshowList', {}, Meteor.userId(), function(error, result) {
        if (typeof error !== "undefined") {
            logger.error("getSlideshowList : ", error);
            callback(error);
        } else {
            logger.info("getSlideshowList : ", result);
            callback(result);
        }
    });
};


SlideshowControler.prototype.get = function(callbackReturn) {
    if (typeof callbackReturn === "undefined" || callbackReturn instanceof goog.events.BrowserEvent) {
        this.getList(this.get);
        return;
    }
    if (typeof callbackReturn === "object" && typeof callbackReturn.errorType === "undefined") { //is it the callback && is there an error 
        if (callbackReturn.titlesArray.length == 0) {
            alert("There is no slideshow to load, create a slideshow to start");
            return;
        }
        var title = prompt("which slideshow to load ? " + callbackReturn.titlesArray);
        slideshowControler.getSlideshowModel({
            title: title
        });
    } else {
        logger.error("getSlideshowControler : error : ", callbackReturn);
    }
};



SlideshowControler.prototype.getSlideshowModel = function(options, callback) {
    if (Meteor.userId() === null) {
        alert("you have to be connected as a user \nlogin : user1@yopmail.com \npswd : user1user1");
        return;
    }

    Meteor.call("getSlideshow", options, Meteor.userId(), function(error, result) {
        logger.debug(error, result);
        if (typeof error !== "undefined") {
            logger.error("getSlideshow : get error ", error);
        } else {
            var slideshowId = result;

            //arret des precedentes ubscriptions si existante
            if (subscriptionSlideshow !== null)
                subscriptionSlideshow.stop();
            if (subscriptionSlides !== null)
                subscriptionSlides.stop();
            if (subscriptionElements !== null)
                subscriptionElements.stop();
            // if (subscriptionRemote !== null)
            //     subscriptionRemote.stop();
            if (subscriptionLocks !== null)
                subscriptionLocks.stop();

            //nouvelles sub
            if (typeof callback === 'function') {
                subscriptionSlideshow = Meteor.subscribe(slideshowId, callback);
            } else {
                subscriptionSlideshow = Meteor.subscribe(slideshowId);
            }
            subscriptionSlides = Meteor.subscribe("slides" + slideshowId);
            subscriptionElements = Meteor.subscribe("elements" + slideshowId);
            subscriptionRemote = Meteor.subscribe("remote" + slideshowId);
            subscriptionRemote = Meteor.subscribe("locks" + slideshowId);

            logger.info("getSlideshow ", result, ": done with subscribes");


        }
    });
};