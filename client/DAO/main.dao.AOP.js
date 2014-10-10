/**
 * Object on which simple logging is added through AOP
 * before call : Object.functionName : arguments
 * after : Object.functionName : return its return
 * @type {Object}
 */
var logginAop = {
	"ServerBackendDAO": ServerBackendDAO,
	"CommonDao": CommonDao,
	"LockDAO": LockDAO
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

