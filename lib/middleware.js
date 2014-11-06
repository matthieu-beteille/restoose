/*
    Middleware system : IN DEVELOPMENT
 */
var restoose = require('./restoose'),
  path = require('path'),
  middlewares = require(path.join(restoose.configPath(), 'middlewares')),
  rules = require(path.join(restoose.configPath(), 'rules')),
  _ = require('underscore');


var app, models;

/*
    Function used to know if a particular method for a specific model has its own middleware functions defined in rules.js
 */
var hasItsOwnMiddlewares = function(model, method){

  var result = false;
  if(model && method){
    if(model in rules){
      if(method in rules[model]){
        result = true;
      }
    }
  } else if(model && !method){
    if(model in rules){
      result = true;
    }
  }

  return result;

};

/*
  Function to apply a main middleware to every methods unspecified in rules.js
 */
var setMainMiddleware = function(rules){

  _.each(models, function(mongoModel, model){
    setModelMainMiddleware(model, rules);
  })

};

var setModelMainMiddleware = function(model, mws){

  var modelRoute = '/api/' + model;
  var itemRoute = '/api/' + model + '/:id';

  if(!hasItsOwnMiddlewares(model, 'create')){
    _.each(mws, function(mw){
      console.log(mw);
      app.post(modelRoute, function(req, res, next){
        middlewares[mw](req, res, next);
      });
    })
  }

  if(!hasItsOwnMiddlewares(model, 'edit')){
    _.each(mws, function(mw){
      app.put(itemRoute, function(req, res, next){
        middlewares[mw](req, res, next);
      });
    })
  }

  if (!hasItsOwnMiddlewares(model, 'delete')){
    _.each(mws, function(mw){
      console.log('ok');
      app.delete(itemRoute, function(req, res, next){
        middlewares[mw](req, res, next);
      });
    })
  }

  if (!hasItsOwnMiddlewares(model, 'get')){
    _.each(mws, function(mw){
      app.get(itemRoute, function(req, res, next){
        middlewares[mw](req, res, next);
      });
    })
  }

  if (!hasItsOwnMiddlewares(model, 'query')){
    _.each(mws, function(mw){
      app.get(modelRoute, function(req, res, next){
        middlewares[mw](req, res, next);
      });
    })
  }
};


module.exports = {

  setMainMiddleware: function(app, models){
    if('*' in rules){
      setMainMiddleware(rules['*']);
    }
  },

  setMainModelMiddleware: function(app, model){
    if('*' in rules[model]){
      setModelMainMiddleware(model, rules[model]['*']);
    }
  },

  setMiddleware : function(app, modelName, route, action){

    function setMW(mws, action, route){
      _.each(mws, function(mw){
        if(action=='create'){
          app.post(route, function(req, res, next){
            middlewares[mw](req, res, next);
          })
        } else if (action=='edit'){
          app.put(route, function(req, res, next){
            middlewares[mw](req, res, next);
          })
        } else if (action=='get' || action =='query'){
          app.get(route, function(req, res, next){
            middlewares[mw](req, res, next);
          })
        } else if (action=='delete'){
          app.delete(route, function(req, res, next){
            middlewares[mw](req, res, next);
          })
        }
      });
    }

    if(modelName in rules && action in rules[modelName]){
      setMW(rules[modelName][action], action, route);
    } else if(modelName in rules && '*' in rules[modelName]){
      setMW(rules[modelName]['*'], action, route);
    } else if('*' in rules){
      setMW(rules['*'], action, route);
    }

  },

  setNestedMiddleware: function(app, modelName, nestedModelName, route, action){

    function setMW(mws, action, route){
      _.each(mws, function(mw){
        if(action=='set' || action == 'create'){
          app.post(route, function(req, res, next){
            middlewares[mw](req, res, next);
          })
        } else if(action=='edit'){
          app.put(route, function(req, res, next){
            middlewares[mw](req, res, next);
          })
        } else if(action=='remove'){
          app.delete(route, function(req, res, next){
            middlewares[mw](req, res, next);
          })
        } else if(action=='get'){
          app.get(route, function(req, res, next){
            middlewares[mw](req, res, next);
          })
        }
      });
    }

    if(modelName in rules && nestedModelName in rules[modelName] && action in rules[modelName][nestedModelName]){
      setMW(rules[modelName][nestedModelName][action], action, route);
    } else if(modelName in rules && nestedModelName in rules[modelName] && '*' in rules[modelName][nestedModelName]){
      setMW(rules[modelName][nestedModelName]['*'], action, route);
    } else if(modelName in rules && '*' in rules[modelName]){
      setMW(rules[modelName]['*'], action, route);
    } else if('*' in rules){
      setMW(rules['*'], action, route);
    }

  },

  setCollectionMiddleware: function(app, modelName, collectionName, route, action){

    function setMW(mws, action, route){
      _.each(mws, function(mw){
        if(action=='addTo' || action == 'createAndAddTo'){
          app.post(route, function(req, res, next){
            middlewares[mw](req, res, next);
          })
        } else if(action=='removeFrom'){
          app.delete(route, function(req, res, next){
            middlewares[mw](req, res, next);
          })
        } else if(action=='getCollection' || action=='getCollectionItem'){
          app.get(route, function(req, res, next){
            middlewares[mw](req, res, next);
          })
        }
      });
    }

    if(modelName in rules && collectionName in rules[modelName] && action in rules[modelName][collectionName]){
      setMW(rules[modelName][collectionName][action], action, route);
    } else if(modelName in rules && collectionName in rules[modelName] && '*' in rules[modelName][collectionName]){
      setMW(rules[modelName][collectionName]['*'], action, route);
    } else if(modelName in rules && '*' in rules[modelName]){
      setMW(rules[modelName]['*'], action, route);
    } else if('*' in rules){
      setMW(rules['*'], action, route);
    }
  },

  setCustomMiddleware: function(app, controllerName, route, action){
    function setMW(mws, action, route){
      if(action=='post'){
        _.each(mws, function(mw){
          app.post(route, function(req, res, next){
            middlewares[mw](req, res, next);
          });
        });
      } else if(action=='get'){
        _.each(mws, function(mw){
          app.get(route, function(req, res, next){
            middlewares[mw](req, res, next);
          });
        });
      } else if(action=='delete'){
        _.each(mws, function(mw){
          app.delete(route, function(req, res, next){
            middlewares[mw](req, res, next);
          });
        });
      } else if(action=='put'){
        _.each(mws, function(mw){
          app.put(route, function(req, res, next){
            middlewares[mw](req, res, next);
          });
        });
      }
    }

    if(controllerName in rules){
      setMW(rules[controllerName], action, route);
    } else if ('*' in rules){
      setMW(rules['*'], action, route);
    }

  }

};





