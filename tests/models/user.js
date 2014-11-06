var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

module.exports = {

  schema: {
    username: String,
    age: Number,
    cat:  { type: Schema.Types.ObjectId, ref: 'cat'},
    dog:  { type: Schema.Types.ObjectId, ref: 'dog'},
    weapons: [{type: Schema.Types.ObjectId, ref: 'weapon'}],
    groups: [{type: Schema.Types.ObjectId, ref: 'group'}]
  },

  associations: {
    weapons: {via: 'owner', type: 'oneToMany'},
    groups: {via: 'users', type: 'manyToMany'},
    dog: {via: 'owner'}
  }

  /*beforeSave: function(model, next){
    next();
    // Do something to test beforeSave
    /*bcrypt.hash(model.password, null, null, function(err, hash) {
      model.password=hash;
      next();
    });
  }*/
};

