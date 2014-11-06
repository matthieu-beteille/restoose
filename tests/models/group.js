var mongoose = require('mongoose'),
Schema = mongoose.Schema;

module.exports = {

	schema : {
		name:  String,
		users: [{ type: Schema.Types.ObjectId, ref: 'user'}]
	},

	associations : {
		users: { via : 'groups', type: 'manyToMany' }
	}


};