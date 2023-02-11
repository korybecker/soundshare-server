const express = require('express');
const router = express.Router();

const requireAuth = require('../../../middleware/requireAuth');

module.exports = (userService) => {
	router
		.post('/login', userService.loginUser)
		.post('/signup', userService.signupUser)
		.get('/login', (req, res) => {
			res.send('joe mama');
		})
		.get('/:username', userService.getUser)
		.delete('/:userId', requireAuth, userService.deleteUser);

	return router;
};
