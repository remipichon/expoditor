ServerBackendDAO = function(){};

ServerBackendDAO.prototype.clearServerData = function(str) {
    logger.info("ServerBackendDAO.prototype.clearServerData");
    Meteor.call('clearServerData', function(error, result) {
        logger.info("ServerBackendDAO.prototype.clearServerData : server answered with ", result);
    });
};

ServerBackendDAO.prototype.clearDynamiqueServerData = function(str) {
    logger.info("ServerBackendDAO.prototype.clearDynamiqueServerData");
    Meteor.call('clearDynamiqueServerData', function(error, result) {
        logger.info("ServerBackendDAO.prototype.clearDynamiqueServerData : server answered with ", result);
    });
};

ServerBackendDAO.prototype.unloadToStore = function(str) {
    logger.info("ServerBackendDAO.prototype.unloadToStore");
    Meteor.call('unloadToStore', str, function(error, result) {
        logger.info("ServerBackendDAO.prototype.unloadToStore : server answered with ", result);
    });
};

ServerBackendDAO.prototype.loadToEdit = function(str) {
    logger.info("ServerBackendDAO.prototype.loadToEdit");
    Meteor.call('loadToEdit', str, function(error, result) {
        logger.info("ServerBackendDAO.prototype.loadToEdit : server answered with ", result);
    });
};

ServerBackendDAO.prototype.getInfos = function(str) {
    logger.info("ServerBackendDAO.prototype.getInfos");
    Meteor.call('getInfos', str, function(error, result) {
        logger.info(error,result)
        slideshows = result.slideshows;
        slides = result.slides;
        elements = result.elements;
        locks = result.locks;
        slideshowPublished = result.slideshowPublished;

        logger.info("***get infos***")
        logger.info("nb slideshow :", slideshows);
        logger.info("nb slides :", slides);
        logger.info("nb elements :", elements);
        logger.info("nb locks :", locks);
        logger.info("slideshowPublished :", slideshowPublished);
         logger.info("***all are set in global variable***")
    });
};