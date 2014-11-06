var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../utils');


/*
 @description: Generic function retrieving a resource
 @params:
           - req: request object
           - res: response object
           - schema: model schema
           - model:  mongoose model

 TODO: Ajouter la gestion de différents paramètres (si on ne veut qu'un certain nombres d'attr etc)
 */
module.exports = function(req, res, schema, model){

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

  model.findById(req.params.id).populate(populate).exec(function(err, model){
    if(err){
      res.status(500).send(err)
    } else if (model){
      res.status(200).send(model)
    } else {
      res.status(404).send('not found');
    }
  })

};