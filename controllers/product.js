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
