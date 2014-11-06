var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../../utils');

/*
 @description: Generic function removing a nested resource
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

      linkedModel.findById(record[attr]).exec(function(err, newModel){
        if(err){
          res.status(500).send(err)
        } else if(newModel){
          if(linkingAttribute){
            if(associationType && associationType=='oneToMany'){
              newModel[linkingAttribute].pull(record);
            } else {
              newModel[linkingAttribute]= undefined;
            }
          }
          newModel.save(function(err, newModel){
            if(err){
              res.status(500).send(err)
            } else {
              record[attr]=undefined;
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