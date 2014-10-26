/**
 * Object on which simple logging is added through AOP
 * before call : Object.functionName
 * @type {Object}
 */
var logginAop = {
	"GoogEditor": GoogEditor,
	"GoogDragger": GoogDragger,
	"ResizeService": ResizeService
};


for (strKey in logginAop) {
	(function(strKey) {
		var obj = logginAop[strKey];
		console.log("add AOP on", strKey);

		Aop.around("", function(f) {
			logger.info("   Service   " + strKey + "." + f.fnName + " called with ", f.arguments);
			var retour = Aop.next(f, f.self); //mandatory
			return retour; //mandatory
		}, [obj.prototype]);

	})(strKey);

}