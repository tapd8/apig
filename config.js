const config = {
	'intervalsDesc': '检查配置文件更新间隔时间，单位为毫秒',
	'intervals': 5000,
	'host': '0.0.0.0',
	'port': 3080,
	'tapDataServer': {
		'url': 'http://127.0.0.1:3030/api/apiModules',
		'tokenUrl': 'http://127.0.0.1:3030/api/users/generatetoken',
		'reportUrl': 'http://127.0.0.1:3030/api/Workers/upsertWithWhere',
		'accessCode': 'bd16c77a-2111-499c-b2ae-a35c587ea83a',
	},

	'reportIntervals': 1000,
	'reportData': {
		'worker_type': 'api-server',
		'process_id': 'd2f1cc40-552a-11e9-8ff4-059b83989412'
	},

	'cacheDir': 'cache',
	'logDir': 'logs',

	'jwtSecretKey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
};

const api_server_port = process.env['API_SERVER_PORT'];
config.port = api_server_port || 3080;

const tapdata_port = process.env['TAPDATA_PORT'] || '3030';
const tapdata_host = process.env['TAPDATA_HOST'] || '127.0.0.1';
const tapdata_origin = process.env['TAPDATA_ORIGIN'] || `http://${tapdata_host}:${tapdata_port}`;
const process_id = process.env['API_SERVER_ID'] || 'd2f1cc40-552a-11e9-8ff4-059b83989412';

config.tapDataServer.url = `${tapdata_origin}/api/apiModules`;
config.tapDataServer.tokenUrl = `${tapdata_origin}/api/users/generatetoken`;
config.tapDataServer.reportUrl =  `${tapdata_origin}/api/Workers/upsertWithWhere`;
config.reportData.process_id = process_id;

module.exports = config;
