const User = require('../models/user');

exports.createOrUpdateUser = async (req, res) => {
	const { name, email, picture } = req.user;

	const user = await User.findOneAndUpdate(
		{ email: email },
		{ name: email.split('@')[0], picture: picture },
		{ new: true }
	);

	if (user) {
		console.log('====> User Updated', user);
		res.json(user);
	} else {
		const newUser = await new User({ email, name: email.split('@')[0], picture }).save();
		console.log('====> New User', newUser);
		res.json(newUser);
	}
};

exports.currentUser = async (req, res) => {
	const { email } = req.user;

	try {
		const user = await User.findOne({ email: email });

		res.json(user);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: 'Failed to get the currently logged in user'
		});
	}
};
