import {configure, getLogger} from 'log4js';

configure({
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