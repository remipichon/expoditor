PROCESS_ENV = ""; //variable d'environnement
LOG_MODE = "trace";

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


    logger = log.noConflict();
    logger.setLevel(LOG_MODE);
    logger.log = function() {
        var args = Array.prototype.slice.call(arguments);
        console.log.apply(console, args);
    }
    delete log;

    logger.info("logger set in", LOG_MODE);

    if (PROCESS_ENV === "prod") {
        SlideshowState.prototype.recoverData();
    }

    console.log("Meteor startup sucessfully");
});