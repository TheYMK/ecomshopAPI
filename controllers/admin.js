const User = require('../models/user');
const Order = require('../models/order');

// getAllOrders, orderStatus
exports.getAllOrders = async (req, res) => {
	try {
		const allOrders = await Order.find({}).sort('-createdAt').populate('products.product').exec();

		res.json(allOrders);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.orderStatus = async (req, res) => {
	try {
		const { orderId, orderStatus } = req.body;

		const updatedOrder = await Order.findByIdAndUpdate(
			orderId,
			{ order_status: orderStatus },
			{ new: true }
		).exec();
		res.json(updatedOrder);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};
