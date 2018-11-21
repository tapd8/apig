const log4js = require('log4js');

log4js.configure({
	appenders: {
		app: {
			type: 'file',
			filename: 'logs/app.log',
			maxLogSize: 500 * 1024 * 1024,
			backups: 5,
			compress: true
		},
		monitor: {
			type: 'file',
			filename: 'logs/monitor.log',
			maxLogSize: 500 * 1024 * 1024,
			backups: 5,
			compress: true
		},
		generator: {
			type: 'file',
			filename: 'logs/generator.log',
			maxLogSize: 500 * 1024 * 1024,
			backups: 5,
			compress: true
		},
		out: {
			type: 'stdout'
		},
	},
	categories: {
		default: {
			appenders: ['app', 'out'],
			level: 'debug'
		},
		app: {
			appenders: ['app', 'out'],
			level: 'debug'
		},
		monitor: {
			appenders: ['monitor', 'out'],
			level: 'debug'
		},
		generator: {
			appenders: ['generator', 'out'],
			level: 'debug'
		}
	},
});

module.exports = log4js.getLogger();

module.exports.app = log4js.getLogger('app');
module.exports.monitor = log4js.getLogger('monitor');
module.exports.generator = log4js.getLogger('generator');