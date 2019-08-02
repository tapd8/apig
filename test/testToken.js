/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/19
 * @description
 */

const request = require('request');
const Conf = require('conf');
const config = new Conf();


request.post({
	url: config.get('tapDataServer.tokenUrl'),
	form: {
		accesscode: config.get('tapDataServer.accessCode')
	}
}, (err, response, body) => {
	if (response.statusCode === 200) {
		console.log(JSON.parse(body).id)
	} else {
		console.log(err)
	}
})

