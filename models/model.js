var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports = {

  // See mongoose schema  : http://mongoosejs.com/docs/guide.html
  schema:{

  },

  // See associations on restoose wiki on github : http://github.com/matthieu-beteille/restoose
  associations:{

  }

/*
  Example :

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

*/

};

