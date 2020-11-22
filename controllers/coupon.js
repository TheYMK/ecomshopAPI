const Coupon = require('../models/coupon');

// create, remove, list

exports.create = async (req, res) => {
	try {
		const { name, expiry, discount } = req.body.coupon;
		res.json(await new Coupon({ name, expiry, discount }).save());
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.list = async (req, res) => {
	try {
		res.json(await Coupon.find({}).sort({ createdAt: -1 }).exec());
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.remove = async (req, res) => {
	try {
		res.json(await Coupon.findByIdAndRemove(req.params.coupon_id).exec());
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};
