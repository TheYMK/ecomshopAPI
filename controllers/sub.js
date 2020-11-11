const Sub = require('../models/sub');
const slugify = require('slugify');

exports.create = async (req, res) => {
	try {
		const { name, parent } = req.body;

		const sub = await new Sub({ name: name, parent: parent, slug: slugify(name) }).save();

		res.json(sub);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: 'Create sub category failed'
		});
	}
};

exports.read = async (req, res) => {
	const sub = await Sub.findOne({ slug: req.params.slug });

	res.json(sub);
};

exports.list = async (req, res) => {
	const subs = await Sub.find({}).sort({ createdAt: -1 });

	res.json(subs);
};

exports.update = async (req, res) => {
	const { name, parent } = req.body;

	try {
		const updated = await Sub.findOneAndUpdate(
			{ slug: req.params.slug },
			{ name: name, slug: slugify(name), parent: parent },
			{ new: true }
		);

		res.json(updated);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: 'Update sub category failed'
		});
	}
};

exports.remove = async (req, res) => {
	try {
		const removed = await Sub.findOneAndDelete({ slug: req.params.slug });
		res.json(removed);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: 'Delete sub failed'
		});
	}
};
