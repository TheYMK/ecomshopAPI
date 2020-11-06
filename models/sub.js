const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const subSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true, //to remove whitespaces begining and end
			required: 'Name is required',
			minlength: [ 2, 'Name too short' ],
			maxlength: [ 32, 'Name too long' ]
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
			index: true // will help query the database and fetch categories based on slug
		},
		parent: {
			type: ObjectId,
			ref: 'Category',
			required: true
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Sub', subSchema);
