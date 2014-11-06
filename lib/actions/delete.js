var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../utils');

/*
 @description: Generic function to delete a resource
 @params:
           - req: request object
           - res: response object
           - schema: model schema
           - model:  mongoose model
 */
module.exports = function(req, res, schema, model){
  model.findByIdAndRemove(req.params.id).exec(function(err, model){
    if(err){
      res.status(500).send(err);
    } else {
      res.status(200).send(model);
    }
  })
};