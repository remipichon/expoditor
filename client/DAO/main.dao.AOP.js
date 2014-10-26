/**
 * Object on which simple logging is added through AOP
 * before call : Object.functionName : arguments
 * after : Object.functionName : return its return
 * @type {Object}
 */
var logginAop = {
	"CommonDao": CommonDao,
	"LockDAO": LockDAO
};


for (strKey in logginAop) {
	(function(strKey) {
		var obj = logginAop[strKey];
		console.info("add AOP on", strKey);

		Aop.around("", function(f) {
			logger.info("   AOPbefore " + strKey + "." + f.fnName, "called with", ((arguments[0].arguments.length == 0) ? "no args" : arguments[0].arguments));
			var retour = Aop.next(f, obj.prototype); //mandatory
			logger.info("   AOPafter  " + strKey + "." + f.fnName, "which returned", retour);
			return retour; //mandatory
		}, [obj.prototype]);
	})(strKey);
}


/**
 * Object on which simple logging is added through AOP on DAO (CRUD)
	create 
		before : options (args)
		after : _id
	update/delete
		before : this.id, this._id
		after : status

 * @type {Object}
 */

var logginAopDA0 = {
	"ElementDAO": ElementDAO,
	"SlideDAO": SlideDAO,
};


for (namespaceName in logginAopDA0) {
	(function(namespaceName) {

		var namespace = logginAopDA0[namespaceName];

		console.info("add AOP on", namespaceName);

		Aop.around("create", function(fn) {
			logger.info("   AOPbefore " + namespaceName + "." + fn.fnName);
			var retour = Aop.next(fn, fn.self); //mandatory
			logger.info("   AOPafter  " + namespaceName + "." + fn.fnName, " component created with _id", retour);
			return retour; //mandatory
		}, [namespace.prototype]);



		Aop.around("update|delete", function(fn) {
			logger.info("   AOPbefore " + namespaceName + "." + fn.fnName, "on component._id", fn.self._id, "which is", fn.self.id, "on the DOM");
			var retour = Aop.next(fn, fn.self); //mandatory
			logger.info("   AOPafter  " + namespaceName + "." + fn.fnName, "altered", retour, "documents");
			return retour; //mandatory
		}, [namespace.prototype]);

	})(namespaceName);

}