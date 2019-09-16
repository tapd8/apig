// global.appConfig = require('./config');
const application = require('./dist');
const Conf = require('conf');
const config = new Conf();
require('./mixin');
module.exports = application;

if (require.main === module) {
	// Run the application
	const configm = {
		rest: {
			port: config.get('port') || +process.env.PORT || 3030,
			host: config.get('host') || process.env.HOST || 'localhost',
			openApiSpec: {
				// useful when used with OASGraph to locate your application
				setServersFromRequest: true,
			},
		},
	};
	application.main(configm, (result) => {
		if (result && typeof process.send === 'function'){
			process.send({
				type: 'status',
				data: 'running'
			});
		}
	}).catch(err => {
		console.error('Cannot start the application.', err);
		process.send({
			type: 'status',
			data: 'exit',
			msg: err.toString()
		});
		process.exit(1);
	});

}
// require('fs').writeFileSync(`${__dirname}/app.pid`, `${process.pid}\n`, { encoding: 'utf-8'});

