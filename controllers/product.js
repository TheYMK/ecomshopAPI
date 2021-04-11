const Product = require('../models/product');
const slugify = require('slugify');
const User = require('../models/user');

exports.create = async (req, res) => {
	try {
		req.body.slug = slugify(req.body.title);
		const newProduct = await new Product(req.body).save();
		res.json(newProduct);
	} catch (err) {
		console.log(`====> ${err}`);
		// res.status(400).json('Create product failed');
		res.status(400).json({
			error: err.message
		});
	}
};

exports.listAll = async (req, res) => {
	try {
		const products = await Product.find({})
			.limit(parseInt(req.params.count))
			.populate('category')
			.populate('subs')
			.sort([ [ 'createdAt', 'desc' ] ])
			.exec();

		res.json(products);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.remove = async (req, res) => {
	try {
		const removedProduct = await Product.findOneAndRemove({ slug: req.params.slug });

		res.json(removedProduct);
	} catch (err) {
		console.log(`====> ${err}`);
		a;
		res.status(400).json({
			error: err.message
		});
	}
};

exports.read = async (req, res) => {
	try {
		const product = await Product.findOne({ slug: req.params.slug }).populate('category').populate('subs').exec();

		res.json(product);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.getAllProducts = async (req, res) => {
	try {
		const products = await Product.find().populate('category').populate('subs').exec();

		res.json(products);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.update = async (req, res) => {
	try {
		if (req.body.title) {
			req.body.slug = slugify(req.body.title);
		}

		const updated = await Product.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true }).exec();

		res.json(updated);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

// WITHOUT PAGINATION
// exports.list = async (req, res) => {
// 	try {
// 		const { sort, order, limit } = req.body;
// 		const products = await Product.find({})
// 			.populate('category')
// 			.populate('subs')
// 			.sort([ [ sort, order ] ])
// 			.limit(limit)
// 			.exec();

// 		res.json(products);
// 	} catch (err) {
// 		console.log(`====> ${err}`);
// 		res.status(400).json({
// 			error: err.message
// 		});
// 	}
// };

// WITH PAGINATION
exports.list = async (req, res) => {
	try {
		const { sort, order, page } = req.body;
		const currentPage = page || 1;
		const perPage = 3;

		const products = await Product.find({})
			.skip((currentPage - 1) * perPage)
			.populate('category')
			.populate('subs')
			.sort([ [ sort, order ] ])
			.limit(perPage)
			.exec();

		res.json(products);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.productsTotalCount = async (req, res) => {
	try {
		const totalCount = await Product.find({}).estimatedDocumentCount().exec();

		res.json(totalCount);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.productRating = async (req, res) => {
	try {
		const product = await Product.findById(req.params.product_id).exec();
		const user = await User.findOne({ email: req.user.email }).exec();
		const { star, comment } = req.body;
		// check if currently logged in user have already added rating to this product
		let existingRatingObject = product.ratings.find((rating) => rating.postedBy.toString() === user._id.toString());

		// if user haven't left rating yet push new one
		if (existingRatingObject === undefined) {
			const addedRating = await Product.findByIdAndUpdate(
				product._id,
				{
					$push: { ratings: { star: star, comment: comment, postedBy: user._id } }
				},
				{ new: true }
			).exec();
			console.log(addedRating);

			res.json(addedRating);
		} else {
			// if user have already left rating, update existing one
			const updatedRating = await Product.updateOne(
				{ ratings: { $elemMatch: existingRatingObject } },
				{ $set: { 'ratings.$.star': star, 'ratings.$.comment': comment } },
				{ new: true }
			).exec();

			console.log(updatedRating);
			res.json(updatedRating);
		}
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

exports.listRelated = async (req, res) => {
	try {
		const product = await Product.findById(req.params.product_id).exec();

		const relatedProducts = await Product.find({ _id: { $ne: product._id }, category: product.category })
			.limit(4)
			.populate('category')
			.populate('subs')
			.populate('postedBy')
			.exec();

		res.json(relatedProducts);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

// Search / Filter
const handleQuery = async (req, res, query) => {
	try {
		// $text because in our model title and description have text set to true
		const products = await Product.find({ $text: { $search: query } })
			.populate('category', '_id name')
			.populate('subs', '_id name')
			.exec();

		return res.json(products);
	} catch (err) {
		console.log(`====> ${err}`);
	}
};

const handlePrice = async (req, res, price) => {
	try {
		const products = await Product.find({
			price: {
				$gte: price[0], // greater then the first price in the array
				$lte: price[1] // less than the last price in the array
			}
		})
			.populate('category', '_id name')
			.populate('subs', '_id name')
			.exec();

		res.json(products);
	} catch (err) {
		console.log(`====> ${err}`);
	}
};

const handleCategory = async (req, res, category) => {
	try {
		const products = await Product.find({ category: category })
			.populate('category', '_id name')
			.populate('subs', '_id name')
			.exec();

		res.json(products);
	} catch (err) {
		console.log(`====> ${err}`);
	}
};

const handleStars = async (req, res, stars) => {
	Product.aggregate([
		{
			$project: {
				document: '$$ROOT',
				// title: "$title", we can write all fields like so or we can use the above syntax to get all fields in the product model
				// description: "$description"
				floorAverage: {
					$floor: { $avg: '$ratings.star' }
				}
			}
		},
		{ $match: { floorAverage: stars } }
	]).exec((err, aggregate) => {
		if (err) {
			console.log(`====> AGGREGATE ERROR: ${err}`);
			return res.status(400).json({
				error: err.message
			});
		}

		Product.find({ _id: aggregate })
			.populate('category', '_id name')
			.populate('subs', '_id name')
			.exec((err, products) => {
				if (err) {
					console.log(`====> PRODUCT AGGREGATE ERROR: ${err}`);
					return res.status(400).json({
						error: err.message
					});
				}

				res.json(products);
			});
	});
};

const handleSub = async (req, res, sub) => {
	try {
		const products = await Product.find({ subs: sub })
			.populate('category', '_id name')
			.populate('subs', '_id name')
			.exec();

		res.json(products);
	} catch (err) {
		console.log(`====>  ${err}`);
		return res.status(400).json({
			error: err.message
		});
	}
};

const handleShipping = async (req, res, shipping) => {
	try {
		const products = await Product.find({ shipping })
			.populate('category', '_id name')
			.populate('subs', '_id name')
			.exec();

		res.json(products);
	} catch (err) {
		console.log(`====>  ${err}`);
		return res.status(400).json({
			error: err.message
		});
	}
};
const handleColor = async (req, res, color) => {
	try {
		const products = await Product.find({ color })
			.populate('category', '_id name')
			.populate('subs', '_id name')
			.exec();

		res.json(products);
	} catch (err) {
		console.log(`====>  ${err}`);
		return res.status(400).json({
			error: err.message
		});
	}
};
const handleBrand = async (req, res, brand) => {
	try {
		const products = await Product.find({ brand })
			.populate('category', '_id name')
			.populate('subs', '_id name')
			.exec();

		res.json(products);
	} catch (err) {
		console.log(`====>  ${err}`);
		return res.status(400).json({
			error: err.message
		});
	}
};

exports.searchFilters = async (req, res) => {
	const { query, price, category, stars, sub, shipping, color, brand } = req.body;

	if (query) {
		console.log(`====> query: ${query}`);
		await handleQuery(req, res, query);
	}
	// price will be an array. [20, 200]
	if (price !== undefined) {
		console.log(`====> price: ${price}`);
		await handlePrice(req, res, price);
	}

	if (category) {
		console.log(`====> category: ${category}`);
		await handleCategory(req, res, category);
	}

	if (stars) {
		console.log(`====> stars: ${stars}`);
		await handleStars(req, res, stars);
	}

	if (sub) {
		console.log(`====> sub: ${sub}`);
		await handleSub(req, res, sub);
	}

	if (shipping) {
		console.log(`====> shipping: ${shipping}`);
		await handleShipping(req, res, shipping);
	}

	if (color) {
		console.log(`====> color: ${color}`);
		await handleColor(req, res, color);
	}

	if (brand) {
		console.log(`====> brand: ${brand}`);
		await handleBrand(req, res, brand);
	}
};
