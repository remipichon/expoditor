/**
 * Remote controler
 *
 * binding button to switch between technos
 */


/**
 * controler.js
 * RemiP
 */



/**********************************************************
 * init global var and Session
 **********************************************************/


subscriptionSlideshow = null;
subscriptionSlides = null;
subscriptionElements = null;
subscriptionRemote = null;
subscriptionLocks = null;

Slideshow = new Meteor.Collection("slideshow");
Slides = new Meteor.Collection("slides");
Elements = new Meteor.Collection("elements");
Locks = new Meteor.Collection("lock");
Remote = new Meteor.Collection("remoteSlides");

//slide en cours d'édition
CurrentEditing = new Meteor.Collection('currentEditing', {
    connection: null
});

//pour conversion editor vers jmpress
ratio = 5;

//reinit des variables de sessions
Session.set('modalCurrentEditing', false);
Session.set("heavyRefresh", true); //false to update positions and content less frequently







/**********************************************************
 * manage live Remote
 **********************************************************/
Meteor.startup(function() {
    //init toolbar, global pour l'init des editeurs de textes
    toolbar = setToolbar();
    goog.style.setOpacity(goog.dom.getElement('toolbar'), '0');



    //listener jquery pour la remote
    //keypress ne fire pas les arrow sont webkit et IE
    $(document).on("keypress", function(event) {
        var activeSlide = null;
        if (Session.get("clientMode") === "jmpress") {
            activeSlide = $("#jmpress-container .active").attr("id");
        } else if (Session.get("clientMode") === "deck") {
            activeSlide = $(".deck-container .deck-current").attr("id");
        }
        console.log("active slide : ", activeSlide);
        if (activeSlide === null)
            return;

        switch (event.keyCode) {
            case 37: // left
                setActive(activeSlide);
                break;
            case 38: // up
                setActive(activeSlide);
                break;
            case 39: // right
                setActive(activeSlide);
                break;
            case 8: // space
                setActive(activeSlide);
                break;
            case 32: // space
                setActive(activeSlide);
                break;
            case 40: // down
                setActive(activeSlide);
                break;
            default:
                return; // exit this handler for other keys
        }

    });

    console.log("init pres pour test");
    Session.set("clientMode", "editor");
    getSlideshowModel({
        title: 'test1'
    });
    /*setTimeout(function() {
        $($(".editSlideContent")[0]).trigger('click');
    }, 1000);*/
});

/*
 * listen to change on remote
 * TODO : manage remoteMode
 * TODO : l'autorun ne doit recompute qu'au changement de Remote.findOne
 */
Remote.find({}).observeChanges({
    changed: function(id, fields) {
        console.log("remote changed !!")
        var remote = Remote.findOne({});

        if (typeof remote !== "undefined") { //pour eviter une erreur la premeire fois
            var type = Session.get("clientMode");
            if (type === "jmpress") {
                console.log("follow slide !");
                $("#jmpress-container").jmpress("goTo", "#" + remote.activeSlideId);
            } else if (type === "deck") {
                $.deck("go", remote.activeSlideId);
            } else {
                console.log("remote slide active state changed to ", remote.activeSlideId);
            }
        }
    }
});



setActive = function(activeSlide) {
    console.log("setActive in remote", activeSlide);
    var remote = Remote.findOne();

    Remote.update(remote._id, {
        $set: {
            activeSlideId: activeSlide
        }
    });

};

/**********************************************************
 * / end manage live Remote
 **********************************************************/




Template.loadEditor.events({
    'click input': function() {
        Session.set("clientMode", "editor");
    }
});

Template.loadJmpress.events({
    'click input': function() {
        Session.set("clientMode", "jmpress");
        setTimeout(initJmpress, 200);

    }
});

Template.loadDeck.events({
    'click input': function() {
        Session.set("clientMode", "deck");
        setTimeout(initDeck, 200);

    }
});


















