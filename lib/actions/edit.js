var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../utils');

/*
 @description: Generic function editing a resource
 @params:
             - req: request object
             - res: response object
             - schema: model schema
             - model:  mongoose model
 */
module.exports = function(req, res, schema, model){
  var updated = {};

  _.each(schema, function(type, attr){
    if(utils.isEditable(type) && req.param(attr)){
      updated[attr]=req.param(attr);
    }
  });

  model.findByIdAndUpdate(req.params.id, updated, function(err, model){
    if(err){
      res.status(500).send(err)
    } else {
      res.status(200).send(model);
    }
  })
};
