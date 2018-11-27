import {configure, getLogger} from 'log4js';
import * as appConfig from '../config.json';
import * as path from 'path';

const logPath = path.join(path.resolve(path.dirname(path.dirname(__dirname))), appConfig.logDir || 'logs');

configure({
	appenders: {
		app: {
			type: 'file',
			filename: logPath + '/app.log',
			maxLogSize: 500 * 1024 * 1024,
			backups: 5,
			compress: true
		},
		monitor: {
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
		},
		out: {
			type: 'stdout'
		},
	},
	categories: {
		default: {
			appenders: ['monitor', 'out'],
			level: 'info'
		},
		app: {
			appenders: ['app', 'out'],
			level: 'info'
		},
		monitor: {
			appenders: ['monitor', 'out'],
			level: 'info'
		},
		generator: {
			appenders: ['generator', 'out'],
			level: 'info'
		}
	},
});

export const log = {
	default: getLogger(),
	app: getLogger('app'),
	monitor: getLogger('monitor'),
	generator: getLogger('generator')
};