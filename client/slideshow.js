createSlideshowControler = function(callbackReturn) {
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
        createSlideshowModel({
            title: title
        }, createSlideshowControler);
    }


};

createSlideshowModel = function(options, callback) {
    console.log("createSlideshow ", options);
    Meteor.call('createSlideshow', options, function(error, result) {
        if (typeof error !== "undefined") {
            console.log("createSlideshow : create error ", error);
            callback(error);
        } else {
            console.log("createSlideshow ", result);
            getSlideshowModel({
                title: options.title,
            });
            callback(1);
        }
    });
};


updateSlideshowControler = function() {
    var title = Slideshow.findOne({}).informations.title;
    title = prompt("Enter a new title for slideshow \n(you also can dblClick on title to edit)", title);
    if(!title) return;
    updateSlideshowModel({
        title: title
    });
};


updateSlideshowModel = function(options) {
    if (typeof options.title === "undefined") {
        console.log("updateSlideshow : title undefined");
        return;
    }

    Meteor.call('updateSlideshow', options, Slideshow.findOne({})._id, Meteor.userId(), function(error, result) {
        if (typeof error !== "undefined") {
            console.log(" updateSlideshow : update error ", error);
        } else {
            console.log("updateSlideshow : done");
        }
    });
};

deleteSlideshowControler = function() {
    var title = Slideshow.findOne().informations.title;
    var answ = confirm("Do you really want to delete all slideshow " + title + " ? It will affect all users, you should'nt do that...");
    if (answ) {
        deleteSlideshowModel();
    }
};


deleteSlideshowModel = function() {
    Meteor.call('removeSlideshow', Slideshow.findOne({})._id, Meteor.userId(), function(error, result) {
        if (typeof error !== "undefined") {
            console.log("removeSlideshow : remove error ", error);
        } else {
            console.log("removeSlideshow : stop all corresponding subscriptions");
            //arret de la precedente si existante
            if (subscriptionSlideshow !== null)
                subscriptionSlideshow.stop();

        }
    });
};



getSlideshowList = function(callback) {
    if (typeof callback !== "function")
        callback = printResult;

    Meteor.call('getSlideshowList', {}, Meteor.userId(), function(error, result) {
        if (typeof error !== "undefined") {
            console.log("getSlideshowList : ", error);
            callback(error);
        } else {
            console.log("getSlideshowList : ", result);
            callback(result);
        }
    });
};


getSlideshowControler = function(callbackReturn) {
    if (typeof callbackReturn === "undefined") {
        getSlideshowList(getSlideshowControler);
        return;
    }
    if (typeof callbackReturn === "object" && typeof callbackReturn.errorType === "undefined") { //is it the callback && is there an error 
        if (callbackReturn.titlesArray.length == 0) {
            alert("There is no slideshow to load, create a slideshow to start");
            return;
        }
        var title = prompt("which slideshow to load ? " + callbackReturn.titlesArray);
        getSlideshowModel({
            title: title
        });
    } else {
        console.log("getSlideshowControler : error : ", callbackReturn);
    }
};



getSlideshowModel = function(options) {
    if (Meteor.userId() === null) {
        alert("you have to be connected as a user \nlogin : user1@yopmail.com \npswd : user1user1");
        return;
    }

    console.log("getSlideshow ", options);
    Meteor.call("getSlideshow", options, Meteor.userId(), function(error, result) {
        if (typeof error !== "undefined") {
            console.log("getSlideshow : get error ", error);
        } else {
            var slideshowId = result;

            //arret des precedentes ubscriptions si existante
            if (subscriptionSlideshow !== null)
                subscriptionSlideshow.stop();
            if (subscriptionSlides !== null)
                subscriptionSlides.stop();
            if (subscriptionElements !== null)
                subscriptionElements.stop();
            if (subscriptionRemote !== null)
                subscriptionRemote.stop();
            if (subscriptionLocks !== null)
                subscriptionLocks.stop();

            //nouvelles sub
            subscriptionSlideshow = Meteor.subscribe(slideshowId);
            subscriptionSlides = Meteor.subscribe("slides" + slideshowId);
            subscriptionElements = Meteor.subscribe("elements" + slideshowId);
            subscriptionRemote = Meteor.subscribe("remote" + slideshowId);
            subscriptionRemote = Meteor.subscribe("locks" + slideshowId);

            console.log("getSlideshow ", result, ": done with subscribes");
        }
    });
};