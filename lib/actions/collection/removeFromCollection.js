var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  utils = require('../../utils');

/*
 @description: Generic function adding to remove an item from a collection
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

module.exports = function(req, res, model, nestedModel, attr, nestedAttribute, association){
  model.findById(req.params.record).exec(function(err, model){
    nestedModel.findById(req.params.id).exec(function(err, nestedModel){
      if(err){
        res.status(500).send(err)
      } else if (nestedModel){
        //Si un attribut 'via' est précisé dans le fichier modèle, on le met à jour sur le modèle à ajouter
        if(nestedAttribute){
          if(association=='oneToMany'){
            nestedModel[nestedAttribute] = undefined;
          } else if(association=='manyToMany'){
            nestedModel[nestedAttribute].pull(model)
          }
          nestedModel.save(function(err, nestedModel){
            model[attr].pull(nestedModel);
            model.save(function(err, model){
              if(err){
                res.status(500).send(err)
              } else {
                res.status(200).send(nestedModel)
              }
            })
          })
        } else {
          model[attr].pull(nestedModel);
          model.save(function(err, model){
            if(err){
              res.status(500).send(err)
            } else {
              res.status(200).send(nestedModel)
            }
          })
        }
      } else {
        res.status(404).send('not found')
      }
    })
  })
};