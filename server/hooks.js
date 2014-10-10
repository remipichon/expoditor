Hooks.onLoggedIn = function(userId) {
	if (typeof logger === "undefined") {
		console.log("******* onLoggedIn", userId)

	} else {
		logger.log("******* onLoggedIn", userId)
	}
}

Hooks.onLoggedOut = function(userId) {
	logger.log("******* onLoggedOut", userId);
	SlideshowHelper.prototype.removeAccessToSlideshowForUser(userId);
}

Hooks.onCloseSession = function(userId) {
	logger.log("******* onCloseSession", userId);
	SlideshowHelper.prototype.removeAccessToSlideshowForUser(userId);
}