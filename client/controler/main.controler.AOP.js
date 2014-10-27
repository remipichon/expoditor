/**
 * Object on which simple logging is added through AOP
 * before call : Object.functionName
 * @type {Object}
 */
var logginAop = {
	"ElementControler": ElementControler,
	"TimelineControler": TimelineControler,
	"SlideControler": SlideControler
};


for (namespace in logginAop) {
	(function(namespace) {
		var obj = logginAop[namespace];
		console.log("add AOP on", namespace);

		Aop.around("", function(f) {
			logger.info("   Controler   " + namespace + "." + f.fnName);
			var retour = Aop.next(f, f.self); //mandatory
			return retour; //mandatory
		}, [obj.prototype]);

	})(namespace);
}