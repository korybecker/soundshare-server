const mongoose = require('mongoose');
// Connection URI
const uri = process.env.DB_CONN_STRING;

// Import logger
const config = require('../config')[process.env.NODE_ENV || 'development'];
const log = config.log();

// Connect to DB
const connectDB = async () => {
	mongoose
		.connect(uri)
		.then(() => log.info(`Connected to SoundShare DB`))
		.catch((err) => {
			throw new Error(err);
		});
};

module.exports = connectDB;
