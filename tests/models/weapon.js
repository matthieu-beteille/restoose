var mongoose = require('mongoose'),
Schema = mongoose.Schema;

module.exports = {

	schema : {
		name:  String,
    owner: { type: Schema.Types.ObjectId, ref: 'user'}
	},

	associations : {
    owner: {via: 'weapons', type: 'oneToMany'}
	}


};