var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../../utils');

  /*
   @description: Generic function used to add an item to a collection
   @params :
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

  // Finding the main model
  model.findById(req.params.record).exec(function(err, model){


    //Finding the nested model
    nestedModel.findById(req.params.id).exec(function(err, nestedModel){

      if(err){
        res.status(500).send(err)
      } else if (nestedModel){

        //If the record is already associated with a model, do nothing
        var alreadyAdded=false;
        _.each(model[attribute], function(id){
          if(id==nestedModel.id){
            alreadyAdded=true;
          }
        });

        if(alreadyAdded){
          res.status(200).send(nestedModel);
          return;
        }

        //  If there is a nested attribute (specified by 'via' in the model associations object)
        if(nestedAttribute){

          if(association=='oneToMany'){
            //  If it's a 'oneToMany' association
            //  We set the nested model's linking attributeibute to the model id
            nestedModel[nestedAttribute] = model.id;
          } else if (association=='manyToMany'){

            //  If it's a 'manyToMany' association
            //  Adding the model id to the nestedAttribute collection
            nestedModel[nestedAttribute].push(model.id);
          }

          //  Saving the nestedModel
          nestedModel.save(function(err, nestedModel){

            //  Pushing the nestedModel in the main model's attribute
            model[attribute].push(nestedModel)  ;

            //Saving the model
            model.save(function(err, model){
              if(err){
                res.status(500).send(err)
              } else {
                //  Sending result
                res.status(200).send(nestedModel)
              }
            })
          })
        } else {
          // If there is no nested attribute specified
          // Only pushing the nested model in the main model's attribute
          model[attribute].push(nestedModel);
          model.save(function(err, model){
            if(err){
              res.status(500).send(err)
            } else {
              // Sending result
              res.status(200).send(nestedModel)
            }
          })
        }
      } else {
        // If the nested model doesn't exist
        res.status(404).send('not found')
      }
    })
  })
};