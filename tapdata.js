/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/31/19
 * @description
 */
const request = require('request');
const appConfig = require('./config');

let token = null;

exports.getToken = getToken = function(cb){
	cb = cb || function(){};
	if( token ){
		cb(token);
	} else {
		request.post({
			url: appConfig.tapDataServer.tokenUrl,
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
