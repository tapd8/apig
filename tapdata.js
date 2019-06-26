/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/31/19
 * @description
 */
const request = require('request');
const appConfig = require('./config');

let token = null;
const getToken = function(cb){
	cb = cb || function(){};
	if( token ){
		cb(token);
	} else {
		request.post({
			url: appConfig.tapDataServer.url + '/api/users/generatetoken',
			form: {
				accesscode: appConfig.tapDataServer.accessCode
			}
		}, (err, response, body) => {
			if( err ){
				console.error('Get access token error', err);
				cb(false);
			} else if( response.statusCode === 200 ){
				let result = JSON.parse(body);
				token = result.id;
				cb(token);
				console.log('Get access token success,', body);
				if( result.ttl)
					setTimeout(()=>{
						token = null;
					}, (result.ttl - 3600) * 1000) // 提前一小时获取token
			} else {
				console.error('Get access token error,', body);
				cb( false )
			}
		})
	}
};

const monitorLimitSetting = function(main){
	const limitSettingResHandle = function (err, response, body) {
		if (err) {
			log.error('download config fail.', err);
		} else {
			// log.debug('download config success.');

			body = body.trim();

			try {
				let limitSetting = JSON.parse(body);
				log.debug("limitSetting@index.js:204: ", limitSetting);

				if (
					limitSetting &&
					limitSetting[0] &&
					limitSetting[0].value &&
					(!isNaN(limitSetting[0].value))
				) {
					switch (limitSetting[0].key) {
						case "defaultLimit":
							if (limitSetting[0].value != appConfig.defaultLimit) {
								main.configMonitor.forceGetRemoteConfig();
								appConfig.defaultLimit = limitSetting[0].value;
							}
							break;
						case "maxLimit":
							if (limitSetting[0].value != appConfig.maxLimit) {
								main.configMonitor.forceGetRemoteConfig();
								appConfig.maxLimit = limitSetting[0].value;
							}
							break;
						default:
							break;
					}
				}

			} catch (e) {
				log.error('parse config error: \n', e);
			}

		}
	};

	setInterval(() => {
		getToken(token => {
			if (token) {
				request.get(
					appConfig.tapDataServer.url + '/api/Settings?filter='
					+ encodeURIComponent('{"where":{"id":"51"}}')
					+ '&access_token=' + token,
					limitSettingResHandle
				);
				request.get(
					appConfig.tapDataServer.url + '/api/Settings?filter='
					+ encodeURIComponent('{"where":{"id":"52"}}')
					+ '&access_token=' + token,
					limitSettingResHandle
				);
			}
		});
	}, 5 * 1000);

};

/**
 * 检查是否启用 load schema 功能
 */
const checkEnableLoadSchemaFeature = function(cb){
	getToken(token => {
		let params = {
			'filter[where][worker_type][in][0]': 'connector',
			'filter[where][worker_type][in][1]': 'transformer',
			'filter[where][ping_time][gte]': new Date().getTime() - 60000
		};
		request.get( appConfig.tapDataServer.url + '/api/Workers?access_token=' + token,
			{qs: params, json: true}, function(err, response, body){
				if (err) {
					console.error('get connector worker process fail.', err);
					cb(false);
				} else if(response.statusCode === 200) {
					if(body && body.length > 0){
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

exports.getToken = getToken;
exports.monitorLimitSetting = monitorLimitSetting;
exports.checkEnableLoadSchemaFeature = checkEnableLoadSchemaFeature;
