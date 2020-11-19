const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const cartSchema = new mongoose.Schema(
	{
		products: [
			{
				product: {
					type: ObjectId,
					ref: 'Product'
				},
				count: Number,
				color: String,
				price: Number
			}
		],
		cart_total: Number,
		total_after_discount: Number,
		orderedBy: { type: ObjectId, ref: 'User' }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
