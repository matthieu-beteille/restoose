var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../../utils');

/*
 @description: Generic function creating and setting a nested resource
 @params:
             - req: request object
             - res: response object
             - schema: nested model schema
             - model: main mongoose model
             - nestedModel: nested mongoose model
             - attribute: main model's attribute that contains the nested object reference
             - nestedAttribute: nested model's attribute that contains the main object reference
             - associationType: main model's association object
 */

module.exports = function(req, res, schema, model, nestedModel, attr, nestedAttribute, associationType){


  model.findById(req.params.record).exec(function(err, record){
    if(err){
      res.status(500).send(err)
    } else if (record) {
      //If the record is already associated with a model, and there is a nestedAttribute, reset it.
      if(record[attr] && nestedAttribute){
        nestedModel.findById(record[attr], function(err, model){
          if(associationType && associationType=='oneToMany'){
            model[nestedAttribute].pull(record);
          } else {
            model[nestedAttribute]=undefined;
          }
          model.save();
        });
      }

      var newModel = {};

      _.each(schema, function(type, attr){
        if(utils.isEditable(type) && req.param(attr)){
          newModel[attr]=req.param(attr);
        }
      });

      nestedModel.create(newModel, function(err, newModel){
        if(err){
          res.status(500).send(err)
        } else {
          if(nestedAttribute){
            if(associationType && associationType=='oneToMany'){
              newModel[nestedAttribute].push(record.id);
            } else {
              newModel[nestedAttribute]=record.id
            }
          }
          newModel.save(function(err, newModel){
            if(err){
              res.status(500).send(err)
            } else {
              record[attr]=newModel._id;
              record.save(function(err, model){
                if(err){
                  res.status(500).send(err)
                } else {
                  res.status(200).send(newModel)
                }
              })
            }
          })
        }
      })

    } else {
      res.status(404).send('not found')
    }
  })
};