const bunyan = require('bunyan');

// Load package.json
const pjs = require('../package.json');

// Get meta info from package.json
const { name, version } = pjs;

// Set up a logger
const getLogger = (serviceName, serviceVersion, level) => {
	return bunyan.createLogger({
		name: `${serviceName}:${serviceVersion}`,
		level,
	});
};

// Config options for different environments
module.exports = {
	development: {
		name,
		version,
		serviceTimeout: 30,
		log: () => getLogger(name, version, 'debug'),
	},
	production: {
		name,
		version,
		serviceTimeout: 30,
		log: () => getLogger(name, version, 'info'),
	},
	test: {
		name,
		version,
		serviceTimeout: 30,
		log: () => getLogger(name, version, 'fatal'),
	},
};
