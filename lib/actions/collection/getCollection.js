var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../../utils');

/*
    @description: Generic function adding to retrieve a model's collection
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

module.exports = function(req, res, schema, model, nestedModel, attribute, nestedAttribute, association){

  var populate = '';

  //  If there is a 'populate' param in the request
  if(req.param('populate')){
    //  If this param is an array
    if(Array.isArray(req.param('populate'))){
      // Adding the item at the end of populate
      _.each(req.param('populate'), function(item){
        populate+=' ' + item;
      })
    } else {
      //  if populate param is not an array
      populate = req.param('populate')
    }
  }

  // Finding the record, populating the collection that we want
  model.findById(req.params.record).populate(attribute).exec(function(err, model){
    if(err){
      res.status(500).send(err);
    } else if( model){
      //  We populate our collection with the populate parameter
      nestedModel.populate(model[attribute], {path: populate}, function (err, models) {
        //Sending results
        res.status(200).send(models);
      })

    } else {
      res.status(404).send('not found')
    }
  })
};