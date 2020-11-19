const User = require('../models/user');
const Product = require('../models/product');
const Cart = require('../models/cart');

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
			let { price } = await Product.findById(cart[i]._id).select('price').exec();
			productObject.price = price;

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
			error: 'Failed to get the currently logged in user'
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
			error: 'Failed to get the currently logged in user'
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
			error: 'Failed to get the currently logged in user'
		});
	}
};
