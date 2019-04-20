/**
 * @author lg<lirufei0808@gmail.com>
 * @date 4/20/19
 * @description
 */

'use strict';

const util = require('util');
const request = require('request');
const getToken = require('./tapdata').getToken;
const pid = process.pid;

function wrapErrorsWithInspect(items) {
	return items.map((item) => {
		if ((item instanceof Error) && item.stack) {
			return {
				inspect: function () {
					return `${util.format(item)}\n${item.stack}`;
				}
			};
		}

		return item;
	});
}

function format(logData) {
	return util.format.apply(util, wrapErrorsWithInspect(logData));
}

function logFacesAppender(config) {

	return function log(event) {
		// convert to logFaces compact json format
		const lfsEvent = {
			threadId: pid,
			threadName: config.application || '', // application name
			date: event.startTime.getTime(), // time stamp
			level: event.level.levelStr, // level (priority)
			loggerName: event.categoryName, // logger name
			message: format(event.data) // message text
		};

		// add context variables if exist
		Object.keys(event.context).forEach((key) => {
			lfsEvent[`p_${key}`] = event.context[key];
		});

		// send to server
		getToken(function(token){

			let url = config.url + '?access_token=' + token;
			request.post({
				url: url,
				json: true,
				body: lfsEvent
			}, (err, resp, body) => {
				if( err ){
					console.error('report fail', err);
				}
			});
		});
	};
}

function configure(config) {
	return logFacesAppender(config);
}

module.exports.configure = configure;
