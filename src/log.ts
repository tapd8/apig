import {configure, getLogger} from 'log4js';
import * as path from 'path';

const appConfig = require('../../config');
const logPath = appConfig.logDir || `logs`;

configure({
	appenders: {
		app: {
			type: 'file',
			filename: logPath + '/app.log',
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
			type: 'stdout'
		}/*,
		http: {
			type: path.join(__dirname, '../../log4js-http'),
			application: 'api-server',
			url: appConfig.tapDataServer.logUrl
		}*/
	},
	categories: {
		default: {
			appenders: ['app', 'out'/*, 'http'*/],
			level: 'info'
		},
		app: {
			appenders: ['app', 'out'/*, 'http'*/],
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

