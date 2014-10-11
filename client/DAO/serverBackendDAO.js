ServerBackendDAO = function(){};

ServerBackendDAO.prototype.clearServerData = function(str) {
    logger.info("ServerBackendDAO.prototype.clearServerData");
    Meteor.call('clearServerData', function(error, result) {
        logger.log("ServerBackendDAO.prototype.clearServerData : server answered with ", result);
    });
};

ServerBackendDAO.prototype.clearDynamiqueServerData = function(str) {
    logger.info("ServerBackendDAO.prototype.clearDynamiqueServerData");
    Meteor.call('clearDynamiqueServerData', function(error, result) {
        logger.log("ServerBackendDAO.prototype.clearDynamiqueServerData : server answered with ", result);
    });
};

ServerBackendDAO.prototype.unloadToStore = function(str) {
    logger.info("ServerBackendDAO.prototype.unloadToStore");
    Meteor.call('unloadToStore', str, function(error, result) {
        logger.log("ServerBackendDAO.prototype.unloadToStore : server answered with ", result);
    });
};

ServerBackendDAO.prototype.loadToEdit = function(str) {
    logger.info("ServerBackendDAO.prototype.loadToEdit");
    Meteor.call('loadToEdit', str, function(error, result) {
        logger.log("ServerBackendDAO.prototype.loadToEdit : server answered with ", result);
    });
};

ServerBackendDAO.prototype.getInfos = function(str) {
    logger.info("ServerBackendDAO.prototype.getInfos");
    Meteor.call('getInfos', str, function(error, result) {
        logger.log(error,result)
        slideshows = result.slideshows;
        slides = result.slides;
        elements = result.elements;
        locks = result.locks;
        slideshowPublished = result.slideshowPublished;

        logger.log("***get infos***")
        logger.log("nb slideshow :", slideshows);
        logger.log("nb slides :", slides);
        logger.log("nb elements :", elements);
        logger.log("nb locks :", locks);
        logger.log("slideshowPublished :", slideshowPublished);
         logger.log("***all are set in global variable***")
    });
};