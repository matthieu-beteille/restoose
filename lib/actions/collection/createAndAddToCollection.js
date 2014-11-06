var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../../utils');

/*
  @description: Generic function used to create and add an item to a collection
  @params:
             - req: request object
             - res: response object
             - schema: nested model schema
             - model: main mongoose model
             - nestedModel: nested mongoose model
             - attribute: main model's attribute that contains the nested object reference
             - nestedAttribute: nested model's attribute that contains the main object reference
             - association: main model's association object

 TODO: tester si le record n'est pas déjà dans la liste avant de l'ajouter, si oui ne rien faire

 */
module.exports = function(req, res, schema, model, nestedModel, attribute, nestedAttribute, association){

  //Finding the main model
  model.findById(req.params.record).exec(function(err, record){
    if(err){
      res.status(500).send(err)
    } else if (record) {

      var newModel = {};

      // Looping through the nested Model's schema
      _.each(schema, function(type, attribute){
        // for each attribute, if it's editable and in the body request
        if(utils.isEditable(type) && req.param(attribute)){
          newModel[attribute]=req.param(attribute);
        }
      });

      //  creating the new nested model
      nestedModel.create(newModel, function(err, newModel){
        if(err){
          res.status(500).send(err)
        } else {

          //  If there is a nestedAttribute (specified by 'via' in the model associations object)
          if(nestedAttribute){

            //  If it's a oneToMany association
            //  Setting the nestedModel's attribute to the record id
            if(association=='oneToMany'){
              newModel[nestedAttribute]=record.id
            } else if(association=='manyToMany'){
              //If it's a manyToMany pushing the record id in the nestedModel's collection
              newModel[nestedAttribute].push(record.id)
            }
          }
          newModel.save(function(err, newModel){
            if(err){
              res.status(500).send(err)
            } else {
              record[attribute].push(newModel);
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