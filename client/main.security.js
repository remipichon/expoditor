Test = function(_id) {
    this._id = _id
};
Test.security = {};
Test.security.print = {
    field: ["content"]
}
Test.prototype.print = function() {
    console.log("Test.print ", this._id);
}
Test.security.print2 = {
    field: ["content2"]
}
Test.prototype.print2 = function() {
    console.log("Test.print2 ", this._id);
}


//add security
var securityAOP = {
    "Test": Test,
    "SlideControler": SlideControler

};
for (namespaceName in securityAOP) {
    (function(namespaceName) {
        var namespace = securityAOP[namespaceName];

        var poincut = "";
        for (fnName in namespace.security) {
            poincut += "\\b" + fnName + "\\b" + "|"; //pour matcher que le mot entier
        }
        poincut = poincut.substr(0, poincut.length - 1);

        console.info("add security on", namespaceName, poincut);
        Aop.around(poincut, function(fn) {
            var componentId = fn.self._id;
            console.info("   secu " + namespaceName + "." + fn.fnName, "component", componentId,
                "field", namespace.security[fn.fnName].field);

            if (typeof componentId !== "string") {
                componentId = fn.arguments[0]._id;
                if (typeof componentId !== "string") {
                    logger.error("   secu", "there is no componentId (either is this or first argument");
                    return -1;
                }
            }

            if (lockService.setLock(componentId, namespace.security[fn.fnName].field)) {

                var retour = Aop.next(fn, fn.self); //mandatory

                lockService.unsetLock(componentId, namespace.security[fn.fnName].field)

                return retour; //mandatory
            }
            return -1;
        }, [namespace.prototype]);
    })(namespaceName);
}



test = new Test("1234");