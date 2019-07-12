global.appConfig = require('./config');
const application = require('./dist');

module.exports = application;

if (require.main === module) {
	// Run the application
	const config = {
		rest: {
			port: appConfig.port || +process.env.PORT || 3030,
			host: appConfig.host || process.env.HOST || 'localhost',
			openApiSpec: {
				// useful when used with OASGraph to locate your application
				setServersFromRequest: true,
			},
		},
	};
	application.main(config, (result) => {
		// if (result && typeof process.send === 'function')
		// 	process.send({
		// 		type: 'status',
		// 		data: 'running'
		// 	});
	}).catch(err => {
		console.error('Cannot start the application.', err);
		process.exit(1);
	});
	// process.on('message', (event) => {
	// 	console.log(event);
	// 	if (event && event.type === 'enableApiStats:changed') {
	// 	}
	// });

	// process.on('message', function (packet) {
	// 	console.log(packet);
	// 	// process.send({
	// 	// 	type: 'process:msg',
	// 	// 	data: {
	// 	// 		success: true
	// 	// 	}
	// 	// });
	// });


}
// require('fs').writeFileSync(`${__dirname}/app.pid`, `${process.pid}\n`, { encoding: 'utf-8'});

