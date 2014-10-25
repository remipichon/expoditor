/**
 * Object on which simple logging is added through AOP
 * before call : Object.functionName 
 * @type {Object}
 */
var logginAop = {
	"ElementControler": ElementControler,
};


for (strKey in logginAop) {
	var obj = logginAop[strKey];
	console.log("add AOP on",strKey);

	Aop.around("", function(f) {
		logger.info("   Controler   "+strKey+"." + f.fnName);
		var retour = Aop.next(f, obj.prototype); //mandatory
		return retour; //mandatory
	}, [obj.prototype]);
}