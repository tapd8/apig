const log = require('./dist').log.app;
const request = require('request');
const path = require('path');
const appConfig = require('./config');

const startTime = new Date().getTime();
const report = function(data) {
	const configPath = path.join(__dirname, 'config.json');
	if( require.cache[configPath])
		delete require.cache[configPath];

	const reportServer = appConfig.reportServer;

	if( !reportServer || !reportServer.url)
		return;

	data = Object.assign(data || {}, appConfig.reportData );

	data['start_time'] = startTime;
	data['ping_time'] = new Date().getTime();

	try {
		request.post({
			url: reportServer.url,
			json: true,
			body: data
		}, (err, resp, body) => {

			if( err ){
				log.error('report fail', err);
			} else {
				log.info(`report complete:`, body);
			}

		});
	} catch (e) {
		log.error('report fail', e);
	}
};

setInterval(report, appConfig.reportIntervals || 5000);

module.exports = report;
