const express = require('express');
const router = express.Router();

const requireAuth = require('../../../middleware/requireAuth');

module.exports = (soundService) => {
	router
		.get('/', soundService.getAllSounds)
		.get('/:soundId', soundService.getSound)
		.post('/', requireAuth, soundService.addSound)
		.patch('/:soundId', requireAuth, soundService.updateSound)
		.delete('/:soundId', requireAuth, soundService.deleteSound);

	return router;
};
