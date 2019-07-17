/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/31/19
 * @description
 */
const request = require('request');
const appConfig = require('./config');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();
const cluster = require('cluster');

let token = null;
const getToken = function (cb) {
	cb = cb || function () { };
	if (token) {
		cb(token);
	} else {
		request.post({
			url: appConfig.tapDataServer.url + '/api/users/generatetoken',
			form: {
				accesscode: appConfig.tapDataServer.accessCode
			}
		}, (err, response, body) => {
			if (err) {
				console.error('Get access token error', err);
				cb(false);
			} else if (response.statusCode === 200) {
				let result = JSON.parse(body);
				token = result.id;
				cb(token);
				console.log('Get access token success,', body);
				if (result.ttl)
					setTimeout(() => {
						token = null;
					}, (result.ttl - 10000) * 1000) // 提前10分钟获取token
			} else {
				console.error('Get access token error,', body);
				cb(false)
			}
		})
	}
};

/**
 * 检查是否启用 load schema 功能
 */
const checkEnableLoadSchemaFeature = function (cb) {
	getToken(token => {
		let params = {
			'filter[where][worker_type][in][0]': 'connector',
			'filter[where][worker_type][in][1]': 'transformer',
			'filter[where][ping_time][gte]': new Date().getTime() - 60000
		};
		request.get(appConfig.tapDataServer.url + '/api/Workers?access_token=' + token,
			{ qs: params, json: true }, function (err, response, body) {
				if (err) {
					console.error('get connector worker process fail.', err);
					cb(false);
				} else if (response.statusCode === 200) {
					if (body && body.length > 0) {
						console.log('exists process connector or transformer, disable load schema feature');
						cb(false);
					} else {
						console.log('not exists process connector or transformer, enable load schema feature');
						cb(true);
					}
				} else {
					console.error('get connector worker process error: \n', body);
					cb(false);
				}
			});
	});
};

// const settingCache = {};
const Conf = require('conf');
const config = new Conf();
const loadNewSettings = function () {
	getToken(token => {
		if (token) {
			let params = {
				filter: '{"where":{"category" :"ApiServer"}}',
				access_token: token
			};
			request.get(
				appConfig.tapDataServer.url + '/api/Settings',
				{ qs: params, json: true },
				(err, response, body) => {
					if (err) {
						console.error('get settings from backend fail.', err);
					} else if (response.statusCode === 200) {
						if (body && body.length > 0) {

							body.forEach(setting => {
								let key = setting.key;
								let oldVal = config.get(key); //settingCache[key] || appConfig[key];
								let newVal = setting.value;
								if (String(oldVal) !== String(newVal)) { // setting changed
									eventEmitter.emit(key + ':changed', newVal, oldVal);
									appConfig[key] = newVal;
									config.set(key, newVal);
									// settingCache[key] = newVal;
								}
							});

						} else {
							console.log('not found api server settings from backend.');
						}
					} else {
						console.error('get settings from backend fail.', err);
					}
				}
			);
		}
	});
};

if (cluster.isMaster) {
	console.log('check backend settings change in main process.');
	// load new settings for api server.
	setInterval(loadNewSettings, 5000);
}

module.exports = eventEmitter;
module.exports.getToken = getToken;
module.exports.checkEnableLoadSchemaFeature = checkEnableLoadSchemaFeature;
