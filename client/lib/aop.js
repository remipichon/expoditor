// Created by Fredrik Appelberg: http://fredrik.appelberg.me/2010/05/07/aop-js.html
// Modified to support prototypes by Dave Clayton
// Modified to support context by Remi Pichon

Aop = {
  // Apply around advice to all matching functions in the given namespaces
  around: function(pointcut, advice, namespaces) {
    // if no namespaces are supplied, use a trick to determine the global ns
    if (namespaces == undefined || namespaces.length == 0)
      namespaces = [(function() {
        return this;
      }).call()];
    // loop over all namespaces 
    for (var i in namespaces) {
      var ns = namespaces[i];
      for (var property in ns) {
        if (typeof ns[property] == 'function' && new RegExp(pointcut,"g").test(property) ){
          //property.match(pointcut)) {
          (function(fn, fnName, ns) {
            // replace the property fn slot with a wrapper which calls
            // the 'advice' Function
            ns[fnName] = function() {
              return advice.call(ns, {
                fn: fn,
                fnName: fnName,
                arguments: arguments,
                self:this
              });
            };
          })(ns[property], property, ns);
        }
      }
    }
  },

  // next: function(f) {
  next: function(f, self) {
    return f.fn.apply(self || this, f.arguments);
  }
};


// add AOP when creating object
// could not add different AOP on different methods
AopLive = {
  // Apply around advice to all matching functions in the given namespace
  around: function(pointcut, advice, namespace, namespaceName) {
    (function(pointcut, advice, namespace, namespaceName) {
      //replace the global name of the constructor to use the one which add AOP
      window[namespaceName] = function(args) {
        //create the object and get its property
        object = new namespace(args);
        var arrayProperties = Object.getOwnPropertyNames(object);

        //replace all of its matching function by the advice
        for (var id = 0; id < arrayProperties.length; id++) {
          var property = arrayProperties[id];
          if (typeof object[property] === "function" && property.match(pointcut)) {
            (function(namespace, fn, fnName) {
              logger.debug("add AOP on", fnName);
              namespace[fnName] = function() {
                return advice.call(namespace, {
                  fn: fn,
                  fnName: fnName,
                  arguments: arguments,
                  self: namespace
                });
              }
            })(object, object[property], property);
          }
        }
        return object;
      }
    })(pointcut, advice, namespace, namespaceName);
  },

  next: function(f) {
    return f.fn.apply(f.self, f.arguments);
  }
}