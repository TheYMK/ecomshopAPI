const admin = require('../firebase');
const User = require('../models/user');

exports.authCheck = async (req, res, next) => {
	try {
		const firebaseUser = await admin.auth().verifyIdToken(req.headers.authtoken);
		// console.log('====> FIREBASE USER IN AUTHCHECK', firebaseUser);
		req.user = firebaseUser;
		next();
	} catch (err) {
		console.log(err);
		res.status(401).json({
			error: 'Invalid or expired token'
		});
	}
};

// the above middleware will be apply before this one. So we will already have the user under req.user
exports.adminCheck = async (req, res, next) => {
	const { email } = req.user;

	const adminUser = await await User.findOne({ email: email });

	if (adminUser.role !== 'admin') {
		res.status(403).json({
			err: 'Admin resource. Access denied'
		});
	} else {
		next();
	}
};
