var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('./utils'),
  Schema = mongoose.Schema,
  path = require('path'),
  uniqueValidator = require('mongoose-unique-validator');

/*
    Requiring every generic methods from files.
 */
var genericQuery = require('./actions/query'),
  genericGet = require('./actions/get'),
  genericPost = require('./actions/create'),
  genericPut = require('./actions/edit'),
  genericDelete = require('./actions/delete'),
  genericAddTo = require('./actions/collection/addToCollection'),
  genericCreateAndAddTo = require('./actions/collection/createAndAddToCollection'),
  genericCreateNested = require('./actions/nestedResource/createNestedResource'),
  genericSetNested = require('./actions/nestedResource/setNestedResource'),
  genericRemoveNested = require('./actions/nestedResource/removeNestedResource'),
  genericGetNested = require('./actions/nestedResource/getNestedResource'),
  genericEditNested = require('./actions/nestedResource/editNestedResource'),
  genericGetCollection = require('./actions/collection/getCollection.js'),
  genericGetCollectionItem = require('./actions/collection/item/getCollectionItem.js'),
  genericRemoveFrom = require('./actions/collection/removeFromCollection.js');

var models = {} ;
var modelFiles = {};
var generated = false;

var modelPath, controllerPath, configPath;

var temporaryMiddleware = function(req, res, next){
  console.log('middleware');
  next();
};

var MW = require('./middleware');

var mapRoutes = function(app) {
  if(controllerPath && configPath){
    var routes = require(path.join(configPath,'routes.js'));

    _.each(routes, function (value, key) {
      var method = key.split(' ')[0];
      var route = key.split(' ')[1];
      var action = require(path.join(controllerPath,value.controller + '.js'))[value.action];
      switch (method) {
        case 'get':
          MW.setCustomMiddleware(app, value.controller, route, 'get');
          app.get(route, action);
          break;
        case 'post':
          MW.setCustomMiddleware(app, value.controller, route, 'post');
          app.post(route, action);
          break;
        case 'delete':
          MW.setCustomMiddleware(app, value.controller, route, 'delete');
          app.delete(route,  action);
          break;
        case 'put':
          MW.setCustomMiddleware(app, value.controller, route, 'put');
          app.put(route, action);
          break;
      }
    })
  } else {
    throw 'Path not set';
  }
};


var capitalise = function(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
};


module.exports = {

  /*
      Function creating mongoose models, and the REST API, call cb when done
   */
  generateAPI : function(app, options, cb) {

    if(!generated){

      if(options.modelPath && options.configPath && options.controllerPath){
        modelPath = options.modelPath;
        controllerPath = options.controllerPath;
        configPath = options.configPath;
      } else {
        throw 'generateAPI() needs modelPath, rootPath, and configPath';
      }

      require("fs").readdirSync(modelPath).forEach(function (file) {
        //Le nom du modèle sera le nom du fichier avant le '.js'
        var modelName = file.split('.')[0];
        //On importe ce fichier
        var modelFile = require(path.join(modelPath,file));
        //On créé le schéma mongoose définit dans l'objet schema
        var schema = new mongoose.Schema(modelFile.schema);

        //Handling BeforeSave functions
        if(modelFile.beforeSave){
          schema.pre('save', function(next){
            modelFile.beforeSave(this, next);
          })
        }

        schema.plugin(uniqueValidator);

        models[modelName] = mongoose.model(modelName, schema);

        global[capitalise(modelName)] = models[modelName];
        //Creating model and linking it to app context
        //ctx[modelName] = mongoose.model(modelName, schema);

      //  models[modelName] = model[modelName];
        modelFiles[modelName] = modelFile;
      });

      // Declaring every custom methods/routes
      mapRoutes(app);

      // For each model file from /models
      require("fs").readdirSync(modelPath).forEach(function (file) {
        //Model name will be the file name before '.js'
        var modelName = file.split('.')[0];

        //Requiring modelFile
        var modelFile = require(path.join(modelPath,file));
        // variable storing mongo model at each loop
        var mongoModel = models[modelName];

        var modelRoute = '/api/' + modelName;
        var itemRoute = '/api/' + modelName + '/:id';

        /*
              Model's query function : GET /api/model
         */

        MW.setMiddleware(app, modelName, modelRoute, 'query');

        app.get(modelRoute, function(req, res){
          genericQuery(req, res, modelFile.schema, mongoModel)
        });

        /*
            Model's create function : POST /api/model
         */

        MW.setMiddleware(app, modelName, modelRoute, 'create');

        app.post(modelRoute, temporaryMiddleware, function(req, res){
          genericPost(req, res, modelFile.schema, modelFile.associations, mongoModel)
        });

        /*
            Model's get function : GET /api/model/:id
         */

        MW.setMiddleware(app, modelName, itemRoute, 'get');

        app.get(itemRoute , temporaryMiddleware, function(req, res){
          genericGet(req, res, modelFile.schema, mongoModel)
        });

        /*
            Model's delete function : DELETE /api/model/:id
         */

        MW.setMiddleware(app, modelName, itemRoute, 'delete');

        app.delete(itemRoute, temporaryMiddleware, function(req, res){
          genericDelete(req, res, modelFile.schema, mongoModel)
        });

        /*
            Model's edit function : PUT /api/model/:id
         */

        MW.setMiddleware(app, modelName, itemRoute, 'edit');

        app.put(itemRoute, temporaryMiddleware, function(req, res){
          genericPut(req, res, modelFile.schema, mongoModel)
        });

        // Creating nested and collections routes
        _.each(modelFile.schema, function(type, attr){

          var linkedModel, linkedModelFile, linkingAttribute, associationType, linkedModelName;

          if(utils.isNested(type)){

            linkedModelName = type.ref;
            linkedModel = models[linkedModelName];
            linkedModelFile = require(path.join(modelPath, type.ref));
            linkingAttribute = modelFile.associations[attr]? modelFile.associations[attr].via:undefined;
            associationType = modelFile.associations[attr]? modelFile.associations[attr].type:undefined;


            var nestedModelRoute = '/api/' + modelName  + '/:record/' + attr ;
            var nestedItemRoute = '/api/' + modelName  + '/:record/' + attr + '/:id';

            /*
                Nested Model's create function : POST /api/model/:record/nestedModel
             */

            MW.setNestedMiddleware(app,modelName, linkedModelName, nestedModelRoute, 'create');
            app.post(nestedModelRoute, temporaryMiddleware, function(req, res){
              genericCreateNested(req, res, linkedModelFile.schema, mongoModel, linkedModel, attr, linkingAttribute,associationType)
            });

            /*
                Nested Model's set function : POST /api/model/:record/nestedModel/:id
             */

            MW.setNestedMiddleware(app,modelName, linkedModelName, nestedItemRoute, 'set');
            app.post(nestedItemRoute, temporaryMiddleware, function(req, res){
              genericSetNested(req, res, linkedModelFile.schema, mongoModel, linkedModel, attr, linkingAttribute,associationType)
            });

            /*
                Nested Model's remove function : DELETE /api/model/:record/nestedModel/:id
             */

            MW.setNestedMiddleware(app,modelName, linkedModelName, nestedModelRoute, 'remove');
            app.delete(nestedModelRoute, temporaryMiddleware, function(req, res){
              genericRemoveNested(req, res, linkedModelFile.schema, mongoModel, linkedModel, attr, linkingAttribute,associationType)
            });

            /*
                Nested Model's get function : GET /api/model/:record/nestedModel
             */

            MW.setNestedMiddleware(app,modelName, linkedModelName, nestedModelRoute, 'get');
            app.get(nestedModelRoute, temporaryMiddleware, function(req, res){
              genericGetNested(req, res, linkedModelFile.schema, mongoModel, linkedModel, attr, linkingAttribute,associationType)
            });

            /*
                Nested Model's edit function : PUT /api/model/:record/nestedModel
             */

            MW.setNestedMiddleware(app,modelName, linkedModelName, nestedModelRoute, 'edit');
            app.put(nestedModelRoute, temporaryMiddleware, function(req, res){
              genericEditNested(req, res, linkedModelFile.schema, mongoModel, linkedModel, attr, linkingAttribute,associationType)
            });


          } else if(utils.isCollection(type)){


            linkedModel = models[type[0].ref];
            linkedModelFile = require(path.join(modelPath,type[0].ref));
            linkingAttribute = modelFile.associations[attr]? modelFile.associations[attr].via:undefined;
            associationType = modelFile.associations[attr]? modelFile.associations[attr].type:undefined;

            var collectionName = attr;

            var collectionRoute = '/api/' + modelName  + '/:record/' + attr;
            var collectionItemRoute = '/api/' + modelName  + '/:record/' + attr + '/:id';


            /*
                 Collection's addTo function : POST /api/model/:record/collection/:id
             */

            MW.setCollectionMiddleware(app, modelName, collectionName, collectionItemRoute, 'addTo');
            app.post(collectionItemRoute , temporaryMiddleware, function(req, res){
              genericAddTo(req, res, modelFile.schema, mongoModel, linkedModel, attr, linkingAttribute,associationType);
            });


            /*
                Collection's createAndAddTo function : POST /api/model/:record/collection
             */

            MW.setCollectionMiddleware(app, modelName, collectionName, collectionRoute, 'createAndAddTo');
            app.post(collectionRoute, temporaryMiddleware, function(req, res){
              genericCreateAndAddTo(req, res, linkedModelFile.schema, mongoModel, linkedModel, attr, linkingAttribute,associationType);
            });


            /*
                Collection's addTo function : GET /api/model/:record/collection
             */

            MW.setCollectionMiddleware(app, modelName, collectionName, collectionRoute, 'getCollection');
            app.get(collectionRoute, temporaryMiddleware, function(req, res){
              genericGetCollection(req, res, linkedModelFile.schema, mongoModel, linkedModel, attr, linkingAttribute,associationType);
            });

            /*
                Collection's getCollectionItem function : GET /api/model/:record/collection/:id
             */

            MW.setCollectionMiddleware(app, modelName, collectionName, collectionItemRoute, 'getCollectionItem');
            app.get(collectionItemRoute , temporaryMiddleware, function(req, res){
              genericGetCollectionItem(req, res, linkedModelFile.schema, mongoModel, linkedModel, attr, linkingAttribute,associationType);
            });

            /*
                Collection's removeFrom function DELETE /api/model/:record/collection/:id
             */

            MW.setCollectionMiddleware(app, modelName, collectionName, collectionItemRoute, 'removeFrom');
            app.delete(collectionItemRoute, temporaryMiddleware, function(req, res){
              genericRemoveFrom(req, res, mongoModel, linkedModel, attr, linkingAttribute, associationType);
            });

          }
        })

      });

      generated = true;
      if(cb){cb();}
    } else {
      throw 'API already generated';
    }

  },

  getModels: function(){
    return models;
  },

  getModelFiles: function(){
    return modelFiles;
  }
};