const log = require('./dist').log.app;
const request = require('request');
const path = require('path');
const appConfig = require('./config');
const getToken = require('./tapdata').getToken;

const hostname = require('os').hostname();
// const startTime = new Date().getTime();
const apiServerStatus = {
	worker_status: {}
};

const report = function (data, token) {
	const configPath = path.join(__dirname, 'config.json');

	const reportServerUrl = appConfig.tapDataServer.url + '/api/Workers/upsertWithWhere?access_token=' + token;

	if (!reportServerUrl || !reportServerUrl)
		return;

	data = Object.assign(data || {}, appConfig.reportData);

	// data['start_time'] = startTime;
	//	data['ping_time'] = new Date().getTime();
	//data['worker_ip'] = hostname;
	data['hostname'] = hostname;
	data['port'] = appConfig.port;
	data['total_thread'] = apiServerStatus.worker_status.total_thread;
	delete apiServerStatus.worker_status.total_thread;
	data['running_thread'] = apiServerStatus.worker_status.running_thread;
	delete apiServerStatus.worker_status.running_thread;
	data['version'] = appConfig.version;

	Object.assign(data, apiServerStatus);

	try {
		delete data.worker_status.workers;
		log.debug('report data', data);
		request.post({
			url: reportServerUrl + encodeURI(`&[where][process_id]=${appConfig.reportData.process_id}&[where][worker_type]=${appConfig.reportData.worker_type}`),
			json: true,
			body: data
		}, (err, resp, body) => {

			if (err) {
				log.error('report fail', err);
			} else if (resp.statusCode === 200) {
				log.debug(`report complete:`, body);
			} else {
				log.error('report fail', body);
			}

		});
	} catch (e) {
		log.error('report fail', e);
	}
};

if (appConfig.model === 'cloud') {
	setInterval(() => {
		getToken(token => {
			if (token)
				report(null, token)
		})
	}, appConfig.reportIntervals || 1000);
}

exports.setStatus = function (status) {
	Object.assign(apiServerStatus, status);
};
