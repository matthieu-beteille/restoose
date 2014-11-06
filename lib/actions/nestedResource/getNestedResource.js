var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../../utils');

/*
 @description: Generic function retrieving a nested resource
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

  model.findById(req.params.record).populate(attr).exec(function(err, record){
    if(err){
      res.status(500).send(err)
    } else if (record) {
      nestedModel.populate(record[attr], {path: populate}, function (err, model) {
        res.status(200).send(model);
      });
    } else {
      res.status(404).send('not found')
    }
  })
};