const Category = require('../models/category');
const slugify = require('slugify');
const Sub = require('../models/sub');

exports.create = async (req, res) => {
	try {
		const { name } = req.body;

		const category = await new Category({ name: name, slug: slugify(name) }).save();

		res.json(category);
	} catch (err) {
		console.log(err);
		res.status(400).json({
			error: 'Create category failed'
		});
	}
};

exports.read = async (req, res) => {
	const category = await Category.findOne({ slug: req.params.slug });

	res.json(category);
};

exports.list = async (req, res) => {
	const categories = await Category.find({}).sort({ createdAt: -1 });

	res.json(categories);
};

exports.update = async (req, res) => {
	const { name } = req.body;

	try {
		const updated = await Category.findOneAndUpdate(
			{ slug: req.params.slug },
			{ name: name, slug: slugify(name) },
			{ new: true }
		);

		res.json(updated);
	} catch (err) {
		console.log(err);
		res.status(400).json({
			error: 'Update category failed'
		});
	}
};

exports.remove = async (req, res) => {
	try {
		const removed = await Category.findOneAndDelete({ slug: req.params.slug });
		res.json(removed);
	} catch (err) {
		console.log(err);
		res.status(400).json({
			error: 'Delete category failed'
		});
	}
};

exports.getSubs = async (req, res) => {
	Sub.find({ parent: req.params._id }).exec((err, subs) => {
		if (err) {
			console.log(err);
			res.status(400).json({
				error: 'Delete category failed'
			});
		}

		res.json(subs);
	});
};
