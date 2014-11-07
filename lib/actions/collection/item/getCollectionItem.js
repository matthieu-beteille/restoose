var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../../../utils');
  
//FIXME : Not working methods

/*
     @description: Generic function adding to retrieve a specific item from a collection
     @params:
                 - req: request object
                 - res: response object
                 - schema: nested model schema
                 - model: main mongoose model
                 - nestedModel: nested mongoose model
                 - attribute: main model's attribute that contains the nested object reference
                 - nestedAttribute: nested model's attribute that contains the main object reference
                 - association: main model's association object
 */

module.exports = function(req, res, schema, model, nestedModel, attr, nestedAttribute, association){
  var populate = '';

  if(req.param('populate')){
    if(Array.isArray(req.param('populate'))){
      _.each(req.param('populate'), function(item){
        populate+=' ' + item;
      })
    } else {
      populate = req.param('populate')
    }
  }
  var params = {_id : req.params.id};
  params[nestedAttribute] = req.params.record;

  nestedModel.findOne(params).populate(populate).exec(function(err, model){
    if(err){
      res.status(500).send(err)
    } else if (model){
      res.status(200).send(model)
    } else {
      res.status(404).send('not found');
    }
  })
};
