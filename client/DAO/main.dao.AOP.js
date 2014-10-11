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
	"TimelineDAO": TimelineDAO
};



for (strKey in logginAopDA0) {
	var obj = logginAopDA0[strKey];
	console.log("add AOP on",strKey);

	Aop.around("create", function(f) {
		logger.info("   AOPbefore "+strKey+"." + f.fnName, "called with", ((arguments[0].arguments.length == 0) ? "no args" : arguments[0].arguments));
		var retour = Aop.next(f, SlideshowHelper.prototype); //mandatory
		logger.info("   AOPafter  "+strKey+"." + f.fnName, " component created with _id", retour._id);
		return retour; //mandatory
	}, [obj.prototype]);


	Aop.around("update|delete", function(f) {
		logger.info("   AOPbefore "+strKey+"." + f.fnName, "on component._id",this._id,"which is",this.id,"on the DOM");
		var retour = Aop.next(f, SlideshowHelper.prototype); //mandatory
		logger.info("   AOPafter  "+strKey+"." + f.fnName, "altered", retour,"documents");
		return retour; //mandatory
	}, [obj.prototype]);
}