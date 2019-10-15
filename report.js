const log = require('./dist').log.app;
const request = require('request');
const path = require('path');
// const appConfig = require('./config');
const Conf = require('conf');
const config = new Conf();

const { getToken, removeToken } = require('./tapdata');

const hostname = require('os').hostname();
// const startTime = new Date().getTime();
const apiServerStatus = {
	worker_status: {}
};

const report = function (data, token) {
	// const configPath = path.join(__dirname, 'config.json');

	const reportServerUrl = config.get('tapDataServer.url') + '/api/Workers/upsertWithWhere?access_token=' + token;

	if (!reportServerUrl || !reportServerUrl)
		return;

	data = Object.assign(data || {}, config.get('reportData'));

	// data['start_time'] = startTime;
	//	data['ping_time'] = new Date().getTime();
	//data['worker_ip'] = hostname;
	data['hostname'] = hostname;
	data['port'] = config.get('port');
	if (apiServerStatus.worker_status.total_thread) {
		data['total_thread'] = apiServerStatus.worker_status.total_thread;
		delete apiServerStatus.worker_status.total_thread;
	}

	if (apiServerStatus.worker_status.running_thread) {
		data['running_thread'] = apiServerStatus.worker_status.running_thread;
		delete apiServerStatus.worker_status.running_thread;
	}
	data['version'] = config.get('version');

	Object.assign(data, apiServerStatus);

	try {
		// delete data.worker_status.workers;
		log.info('report data', data);
		request.post({
			url: reportServerUrl + encodeURI(`&[where][process_id]=${config.get('reportData.process_id')}&[where][worker_type]=${config.get('reportData.worker_type')}`),
			json: true,
			body: data
		}, (err, resp, body) => {

			if (err) {
				log.error('report fail', err);
			} else if (resp.statusCode === 401 || resp.statusCode === 403) {
				console.error('Access token Expired');
				removeToken();
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

let model = config.get('model') || 'cloud';
log.info('Current run model is ' + model);
if (model === 'cloud') {
	log.info('start report api server status to management');
	setInterval(() => {
		getToken(token => {
			if (token)
				report(null, token)
		})
	}, config.get('reportIntervals') || 5000);
}

exports.setStatus = function (status) {
	Object.assign(apiServerStatus, status);
};
