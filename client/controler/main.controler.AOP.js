/**
 * Object on which simple logging is added through AOP
 * before call : Object.functionName
 * @type {Object}
 */
var logginAop = {
	"ElementControler": ElementControler,
};


for (namespace in logginAop) {
	(function(namespace) {
		var obj = logginAop[namespace];
		console.log("add AOP on", namespace);

		Aop.around("", function(f) {
			logger.info("   Controler   " + namespace + "." + f.fnName);
			var retour = Aop.next(f, obj.prototype); //mandatory
			return retour; //mandatory
		}, [obj.prototype]);

	})(namespace);
}