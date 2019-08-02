import { configure, getLogger } from 'log4js';
import * as path from 'path';
const Conf = require('conf');
const config = new Conf();

// const appConfig = require('../../config');
const logPath = config.get('logDir') || path.join(require('os').homedir(), '.tapdata', 'logs');
const appenders = {
	app: {
		type: 'file',
		filename: path.join(logPath, '/api-server.log'),
		maxLogSize: 500 * 1024 * 1024,
		backups: 5,
		compress: true
	},
	/*monitor: {
		type: 'file',
		filename: logPath + '/monitor.log',
		maxLogSize: 500 * 1024 * 1024,
		backups: 5,
		compress: true
	},
	generator: {
		type: 'file',
		filename: logPath + '/generator.log',
		maxLogSize: 500 * 1024 * 1024,
		backups: 5,
		compress: true
	},*/
	out: {
		type: 'stdout',
		level: 'debug'
	}
};
if (config.get('model') === 'cloud') {
	// @ts-ignore
	appenders.http = {
		type: path.join(__dirname, '../../log4js-http'),
		application: 'api-server',
		url: config.get('tapDataServer.url') + '/api/Logs'
	}
}
configure({
	appenders: appenders,
	categories: {
		default: {
			appenders: Object.keys(appenders),
			level: 'info'
		},
		app: {
			appenders: Object.keys(appenders),
			level: 'info'
		}/*,
		monitor: {
			appenders: ['monitor', 'out'],
			level: 'info'
		},
		generator: {
			appenders: ['generator', 'out'],
			level: 'info'
		}*/
	},
});

export const log = {
	default: getLogger(),
	app: getLogger('app'),
	monitor: getLogger('app'),
	generator: getLogger('app')
};
