var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../../utils');

/*
 @description: Generic function editing a nested resource
 @params:
             - req: request object
             - res: response object
             - schema: nested model schema
             - model: main mongoose model
             - nestedModel: nested mongoose model
             - attribute: main model's attribute that contains the nested object reference
             - nestedAttribute: nested model's attribute that contains the main object reference
 */

module.exports = function(req, res, schema, model, nestedModel, attr, nestedAttribute){
  var updated = {};
  _.each(schema, function(type, attr){
    if(utils.isEditable(type) && req.param(attr)){
      updated[attr]=req.param(attr);
    }
  });

  model.findById(req.params.record).exec(function(err, record){
    if(err){
      res.status(500).send(err);
    } else if(record) {
      nestedModel.findByIdAndUpdate(record[attr], updated, function(err, model){
        if(err){
          res.status(500).send(err)
        } else {
          res.status(200).send(model);
        }
      })
    } else {
      res.status(404).send('not found');
    }
  })

};