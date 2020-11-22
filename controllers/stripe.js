const User = require('../models/user');
const Cart = require('../models/cart');
const Product = require('../models/product');
const Coupon = require('../models/coupon');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.createPaymentIntent = async (req, res) => {
	const { couponApplied } = req.body;
	// 1 find user
	const user = await User.findOne({ email: req.user.email }).exec();

	// 2 get user cart total
	const { cart_total, total_after_discount } = await Cart.findOne({ orderedBy: user._id }).exec();

	// console.log('CART TOTAL:', cart_total, 'AFTER DIS%', total_after_discount);

	let finalAmount = 0;

	if (couponApplied && total_after_discount) {
		finalAmount = total_after_discount * 100;
	} else {
		finalAmount = cart_total * 100;
	}

	console.log(`====> Final Amount ${finalAmount}`);
	// create payment intent with order amount with currency
	const paymentIntent = await stripe.paymentIntents.create({
		amount: finalAmount,
		currency: 'usd'
	});

	res.send({
		clientSecret: paymentIntent.client_secret,
		cart_total,
		total_after_discount,
		payable: finalAmount
	});
};
