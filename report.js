const log = require('./dist').log.app;
const request = require('request');
const path = require('path');
const appConfig = require('./config');
const getToken = require('./tapdata').getToken;

const hostname = require('os').hostname();
const startTime = new Date().getTime();
const apiServerStatus = {
	worker_status: {}
};

const report = function(data, token) {
	const configPath = path.join(__dirname, 'config.json');

	const reportServerUrl = appConfig.tapDataServer.reportUrl + '?access_token=' + token;

	if( !reportServerUrl || !reportServerUrl)
		return;

	data = Object.assign(data || {}, appConfig.reportData );

	data['start_time'] = startTime;
	data['ping_time'] = new Date().getTime();
	data['worker_ip'] = hostname;
	data['total_thread'] = 2;
	data['running_thread'] = apiServerStatus.worker_status.status === 'running' ? 2 : 1;

	Object.assign(data, apiServerStatus);

	try {
		log.debug('report data', data);
		request.post({
			url: reportServerUrl + encodeURI(`&[where][process_id]=${appConfig.reportData.process_id}&[where][worker_type]=${appConfig.reportData.worker_type}` ),
			json: true,
			body: data
		}, (err, resp, body) => {

			if( err ){
				log.error('report fail', err);
			} else {
				log.debug(`report complete:`, body);
			}

		});
	} catch (e) {
		log.error('report fail', e);
	}
};

setInterval(() => {
	getToken(token => {
		if( token )
			report(null, token)
	})
}, appConfig.reportIntervals || 1000);

exports.setStatus = function(status){
	Object.assign(apiServerStatus, status);
};
