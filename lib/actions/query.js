/*
 Generic function used to get every models
 */

var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../utils');

/*
 @description: Generic function retrieving every resources
 @params:
         - req: request object
         - res: response object
         - schema: model schema
         - model:  mongoose model

 */
module.exports = function(req, res, schema, model){

  var params = {};

  //For each schema's attribute, if the attribute is a request's parameter we push it into params
  _.each(schema, function(type, attr){
    if(utils.isEditable(type) && req.param(attr)){
      if(type==String){
        //If the parameter is a String we consider it as a REGEXP
        params[attr]=new RegExp(req.param(attr));
      } else{
        params[attr]=req.param(attr);
      }
    }
  });

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

  model.find(params).limit(req.param("limit")).populate(populate).exec(function(err, models){
    if(err){
      res.status(500).send(err)
    } else {

      res.status(200).send(models)
    }
  })

};