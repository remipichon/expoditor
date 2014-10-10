ServerBackendDAO = function(){};

ServerBackendDAO.prototype.clearServerData = function(str) {
    logger.info("ServerBackendDAO.prototype.clearServerData");
    Meteor.call('ServerBackendDAO.prototype.clearServerData', function(error, result) {
        logger.log("ServerBackendDAO.prototype.clearServerData : server answered with ", result);
    });
};

ServerBackendDAO.prototype.clearDynamiqueServerData = function(str) {
    logger.info("ServerBackendDAO.prototype.clearDynamiqueServerData");
    Meteor.call('ServerBackendDAO.prototype.clearDynamiqueServerData', function(error, result) {
        logger.log("ServerBackendDAO.prototype.clearDynamiqueServerData : server answered with ", result);
    });
};

ServerBackendDAO.prototype.unloadToStore = function(str) {
    logger.info("ServerBackendDAO.prototype.unloadToStore");
    Meteor.call('ServerBackendDAO.prototype.unloadToStore', str, function(error, result) {
        logger.log("ServerBackendDAO.prototype.unloadToStore : server answered with ", result);
    });
};

ServerBackendDAO.prototype.loadToEdit = function(str) {
    logger.info("ServerBackendDAO.prototype.loadToEdit");
    Meteor.call('ServerBackendDAO.prototype.loadToEdit', str, function(error, result) {
        logger.log("ServerBackendDAO.prototype.loadToEdit : server answered with ", result);
    });
};

ServerBackendDAO.prototype.getInfos = function(str) {
    logger.info("ServerBackendDAO.prototype.getInfos");
    Meteor.call('ServerBackendDAO.prototype.getInfos', str, function(error, result) {
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