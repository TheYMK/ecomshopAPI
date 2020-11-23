const User = require('../models/user');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Coupon = require('../models/coupon');
const Order = require('../models/order');

exports.userCart = async (req, res) => {
	// console.log(req.body); // {cart:[]}
	const { cart } = req.body;

	let products = [];

	try {
		const user = await User.findOne({ email: req.user.email }).exec();

		// check if cart with logged in user id already exist
		let cartExistByThisUser = await Cart.findOne({ orderedBy: user._id }).exec();

		// if exist we remove the cart from db
		if (cartExistByThisUser) {
			cartExistByThisUser.remove();
			console.log(`====> removed old cart`);
		}

		// creating a brand new product object with additional fields like the chosen color, price, and count
		// because those values can be updated by the user in the cart page
		for (let i = 0; i < cart.length; i++) {
			let productObject = {};

			productObject.product = cart[i]._id;
			productObject.count = cart[i].count;
			productObject.color = cart[i].color;
			// get price so that we can save total
			// we do this for security reason because user can manipulate the price in the localstorage. We can't rely on that.
			// so we want to make sure that the total is calculated in the backend
			let productFromDb = await Product.findById(cart[i]._id).select('price').exec();

			productObject.price = productFromDb.price;

			products.push(productObject);
		}

		console.log('====> products to be saved', products);

		let cartTotal = 0;

		for (let i = 0; i < products.length; i++) {
			cartTotal = cartTotal + products[i].price * products[i].count;
		}

		console.log('====> cartTotal', cartTotal);

		let newCart = await new Cart({
			products: products,
			cart_total: cartTotal,
			orderedBy: user._id
			// total_after_discount to be added soon
		}).save();

		console.log('====> new Cart', newCart);

		res.json({ success: true });
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.getUserCart = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.user.email }).exec();

		const cart = await await Cart.findOne({ orderedBy: user._id })
			.populate('products.product', '_id title price total_after_discount')
			.exec();

		const { products, cart_total, total_after_discount } = cart;

		res.json({ products, cart_total, total_after_discount }); //can be accessed in frontend using req.data.field
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.emptyCart = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.user.email }).exec();
		const cart = await Cart.findOneAndRemove({ orderedBy: user._id }).exec();

		res.json(cart);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.saveAddress = async (req, res) => {
	try {
		const userAddress = await User.findOneAndUpdate(
			{ email: req.user.email },
			{ address: req.body.address }
		).exec();

		res.json({ success: true });
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.applyCouponToUserCart = async (req, res) => {
	try {
		const { coupon } = req.body;

		const validCoupon = await Coupon.findOne({ name: coupon }).exec();
		console.log(validCoupon);
		if (validCoupon === null) {
			return res.json({
				error: 'Invalid coupon'
			});
		}

		const user = await User.findOne({ email: req.user.email }).exec();

		let { products, cart_total } = await Cart.findOne({ orderedBy: user._id })
			.populate('products.product', '_id title price')
			.exec();

		// calculate total after discount
		let totalAfterDiscount = (cart_total - cart_total * validCoupon.discount / 100).toFixed(2);
		await Cart.findOneAndUpdate(
			{ orderedBy: user._id },
			{ total_after_discount: totalAfterDiscount },
			{ new: true }
		).exec();

		res.json(totalAfterDiscount);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.createOrder = async (req, res) => {
	try {
		const { paymentIntent } = req.body.stripeResponse;
		const user = await User.findOne({ email: req.user.email }).exec();

		let { products } = await Cart.findOne({ orderedBy: user._id }).exec();

		let newOrder = await new Order({
			products,
			payment_intent: paymentIntent,
			orderedBy: user._id
		}).save();

		// decrement products quantity, increment sold
		let bulkOption = products.map((item) => {
			return {
				updateOne: {
					filter: { _id: item.product._id }, //IMPORTANT item.product
					update: { $inc: { quantity: -item.count, sold: +item.count } }
				}
			};
		});

		const updatedProduct = await Product.bulkWrite(bulkOption, {});
		console.log('PRODUCT QUANTITY-- AND SOLD++', updatedProduct);

		res.json({ success: true });
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.getOrders = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.user.email }).exec();

		const userOrders = await Order.find({ orderedBy: user._id }).populate('products.product').exec();

		res.json(userOrders);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};
