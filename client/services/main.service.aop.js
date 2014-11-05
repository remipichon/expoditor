/**
 * Object on which simple logging is added through AOP
 * before call : Object.functionName
 * @type {Object}
 */
var logginAop = {
	"GoogEditor": GoogEditor,
	"GoogDragger": GoogDragger,
	"ResizeService": ResizeService,
	"LockService": LockService
};


for (strKey in logginAop) {
	(function(strKey) {
		var obj = logginAop[strKey];
		console.info("add AOP on", strKey);

		Aop.around("", function(f) {
			logger.info("   Service   " + strKey + "." + f.fnName + " called with ", f.arguments);
			var retour = Aop.next(f, f.self); //mandatory
			return retour; //mandatory
		}, [obj.prototype]);

	})(strKey);

}



var logginAop2= {
	//"PositionService": PositionService //too much call on CSStoPos and posToCSS
};


for (namespaceName in logginAop2) {
	(function(namespaceName) {

		var namespace = logginAop2[namespaceName];

		console.info("add AOP on", namespaceName);

		Aop.around("", function(fn) {
			logger.info("  ??  ");
			var retour = Aop.next(fn, fn.self); //mandatory
			logger.info("  ?? ");
			return retour; //mandatory
		}, [namespace.prototype]);

	})(namespaceName);

}