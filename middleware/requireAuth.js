const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const requireAuth = async (req, res, next) => {
	// verify authentication
	const { authorization } = req.headers;

	if (!authorization) {
		return res
			.status(401)
			.json({ error: { message: 'Authorization token required.' } });
	}

	const token = authorization.split(' ')[1];

	// verify token has not been altered
	try {
		const { _id } = jwt.verify(token, process.env.JWT_SECRET);
		// add user id to request object
		req.user = await User.findById(_id).select('_id');
		next();
	} catch (err) {
		return next(err);
	}
};

module.exports = requireAuth;
