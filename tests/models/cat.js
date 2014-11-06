var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports = {
  schema: {
    name: String
  },

  associations: {
    user: {via: 'cat'}
  }
};