var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../utils');

/*
 @description: Generic function creating a resource
 @params:
             - req: request object
             - res: response object
             - schema: model schema
             - associations: model's association object
             - model:  mongoose model
 */
module.exports =  function(req, res, schema, associations, model){
  var newModel = {};
  var nestedResources = [];
  _.each(schema, function(type, attr){
    if(req.param(attr)){
      newModel[attr]=req.param(attr);
    }
  });

  utils.createResource(newModel, schema, model, associations, function(err, newModel){
    if(err){
      res.status(500).send(err);
    } else {
      res.status(200).send(newModel);
    }
  })
};
