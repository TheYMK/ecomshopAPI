const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32,
			text: true // useful for search
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
			index: true //so we can query the db based on the slug
		},
		description: {
			type: String,
			required: true,
			maxlength: 2000,
			text: true // useful for search
		},
		price: {
			type: Number,
			required: true,
			trim: true,
			maxlength: 32
		},
		category: {
			type: ObjectId,
			ref: 'Category'
		},
		subs: [
			{
				type: ObjectId,
				ref: 'Sub'
			}
		],
		quantity: Number,
		sold: {
			type: Number,
			default: 0
		},
		images: {
			type: Array
		},
		shipping: {
			type: String,
			enum: [ 'Yes', 'No' ]
		},
		color: {
			type: String,
			enum: [ 'Black', 'Brown', 'Silver', 'Blue', 'Red', 'Gold' ]
		},
		brand: {
			type: String,
			enum: [ 'Apple', 'Samsung', 'Huawei', 'Microsoft', 'Xiaomi', 'Asus' ]
		},
		ratings: [
			{
				star: Number,
				postedBy: { type: ObjectId, ref: 'User' },
				comment: String
			}
		]
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
