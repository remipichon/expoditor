PROCESS_ENV = ""; //variable d'environnement

/*
 * key : slideshowID
 * value : [userIds...]
 */
slideshowPublished = {};

Meteor.startup(function() {
    console.log(Meteor.exports);

    if (typeof process.env._METEOR === 'undefined') {
        console.log("****** INFOS *****");
        console.log("You can run this project in several mode");
        console.log(" $ _METEOR=prod meteor");
        console.log(" $ _METEOR=dev meteor");
        console.log("default is prod");
        console.log("****** / INFOS *****");
        PROCESS_ENV = "prod";
    } else {
        PROCESS_ENV = process.env._METEOR;
    }
    console.log("startup : mode ", PROCESS_ENV);


    if (PROCESS_ENV === "prod") {
        recoverData();
    }

    console.log("Meteor startup sucessfully");



    logger = log.noConflict();
    logger.setLevel("trace");
    logger.log = function() {
        var args = Array.prototype.slice.call(arguments);
        console.log.apply(console, args);
    }

    delete log;
});