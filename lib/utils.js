var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
  isEditable : function(type){
    return !this.isCollection(type) && !this.isNested(type);
  },

  isCollection : function(type) {
    return _.isArray(type);
  },

  isNested :function(type){
    return (typeof type === 'object' && !(type instanceof Array) && type.type==Schema.Types.ObjectId);
  },

  createResource : function(params, schema, model, associations, cb){
    var self=this;
    var newModel = {};
    var nestedResources = [];

    //For each schema's attribute
    _.each(schema, function(type, attr){


      if(self.isEditable(type) && params[attr]){
        //  If it's an editable attribute (not a nested resource or a collection)
        newModel[attr]=params[attr];
      } else if (self.isNested(type) && params[attr]){
        //  If it's a nested resource, we push it into nestedResources with different data about the resource (schema, model, associations)
        nestedResources.push({attr: attr, params: params[attr], model: models[type.ref], schema: modelFiles[type.ref].schema, associations: modelFiles[type.ref].associations})
      }
    });

    //  Creating the main model
    model.create(newModel, function(err, newModel){
      if(err){
        cb(err)
      } else {

        //  If there is at least one nested resources to create
        if(nestedResources.length>0){

          // We create each nested resource one by one, and then whe call a callback (thanks to async)
          async.each(nestedResources, function(resource, callback){

            // Recursive call to createResource, to create each nested resource
            createResource(resource.params, resource.schema, resource.model, resource.associations,  function(err, nestedResource){
              if(err){
                cb(err)
              } else {

                //  Updating main model attr referencing the new nestedResource
                newModel[resource.attr] = nestedResource.id;
                //  Saving main model
                newModel.save(function(err, newModel){
                  if(err){
                    cb(err)
                  } else {
                    // If there is an association to handle
                    if(associations[resource.attr]){
                      // Associating
                      nestedResource[associations[resource.attr].via] = newModel.id;
                      nestedResource.save(function(err, nestedResource){
                        if(err){
                          callback(err)
                        } else {
                          callback()
                        }
                      })
                    } else {
                      callback()
                    }
                  }
                })
              }
            })
          },  function(err){
            model.findOne(newModel).exec(function(err, newModel){
              cb(null, newModel)
            })
          })
        } else {
          cb(null, newModel)
        }
      }

    })
  }
};