/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/19
 * @description
 */

const request = require('request');
const appConfig = require('../config');

request.post({
	url: appConfig.tapDataServer.tokenUrl,
	form: {
		accesscode: appConfig.tapDataServer.accessCode
	}
}, (err, response, body) => {
	if( response.statusCode === 200 ){
		console.log(JSON.parse(body).id)
	} else {
		console.log(err)
	}
})

