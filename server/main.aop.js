var logginAop = {
	"SlideshowHelper": SlideshowHelper,
	"SlideshowState": SlideshowState
};


for (strKey in logginAop) {
	var obj = logginAop[strKey];
	console.log("add AOP on",strKey);

	Aop.around("", function(f) {
		logger.info("   AOPbefore "+strKey+"." + f.fnName, "called with", ((arguments[0].arguments.length == 0) ? "no args" : arguments[0].arguments));
		var retour = Aop.next(f, SlideshowHelper.prototype); //mandatory
		logger.info("   AOPafter  "+strKey+"." + f.fnName, "which returned", retour);
		return retour; //mandatory
	}, [obj.prototype]);

}

