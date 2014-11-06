var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../../utils');

/*
 @description: Generic function setting a nested resource
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
module.exports = function(req, res, schema, model, linkedModel, attr, linkingAttribute, associationType){

  model.findById(req.params.record).exec(function(err, record){
    if(err){
      res.status(500).send(err)
    } else if (record) {
      //If the record is already associated with a model, and there is a linkingAttribute, reset it.
      if(record[attr] && linkingAttribute){
        linkedModel.findById(record[attr], function(err, model){
          if(associationType && associationType=='oneToMany'){
            model[linkingAttribute].pull(record);
          } else {
            model[linkingAttribute]=undefined;
          }
          model.save();
        });
      };

      linkedModel.findById(req.params.id).exec(function(err, newModel){
        if(err){
          res.status(500).send(err)
        } else if(newModel){
          if(linkingAttribute){
            if(associationType && associationType=='oneToMany'){
              newModel[linkingAttribute].push(record.id);
            } else {
              newModel[linkingAttribute]=record._id;
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
        } else {
          res.status(404).send('not found');
        }
      })

    } else {
      res.status(404).send('not found')
    }
  })
};