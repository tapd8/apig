
const path = require('path');
const homedir = require('os').homedir();
const defaultConfigDir = path.join(homedir, '.tapdata');

const api_server_port = process.env['API_SERVER_PORT'] || '3080';
const api_server_host = process.env['API_SERVER_HOST'] || '0.0.0.0';

const tapdata_port = process.env['TAPDATA_PORT'] || '3030';
const tapdata_host = process.env['TAPDATA_HOST'] || '127.0.0.1';
const tapdata_origin = process.env['TAPDATA_ORIGIN'] || 'http://' + tapdata_host + ':' + tapdata_port;
const oauth_base_url = process.env['OAUTH_BASE_URL'] || 'http://' + tapdata_host + ':' + tapdata_port;
const process_id = process.env['API_SERVER_ID'] || 'f3ebe1b88623ca4f933af4e27f4075a0';
const accessCode = process.env['TAPDATA_ACCESS_CODE'] || '3324cfdf-7d3e-4792-bd32-571638d4562f';

const cacheDir = process.env['CACHE_DIR'] || 'cache';
const api_cache = process.env['API_CACHE'] || path.join(cacheDir, 'server_api_definition.json');
const logDir = process.env['LOG_DIR'] || path.join(defaultConfigDir, 'logs');
const model = process.env['MODEL'] || 'cloud';

const api_file = process.env['API_FILE'] || path.join(defaultConfigDir, 'api.json');
const api_worker_count = +process.env['API_WORKER_COUNT'] || 0; //0=cpu cores


const config = {
	'model': model,
	'version': 'v1.0.0-0-gd48b0c9',
	'intervalsDesc': 'The intervals to check the api definition, unit is milliseconds.',
	'intervals': 5000,
	'host': api_server_host,
	'port': api_server_port,
	'filterNull': true,
	'defaultLimit': 10,
	'maxLimit': 0,
	'apiStatsBatchReport': {
		'enableApiStatsBatchReport': 'true',
		'sizeOfTriggerApiStatsBatchReport': "1000",
		'timeSpanOfTriggerApiStatsBatchReport': "5000",// milliseconds
		'_maxApiStatsBatchSizePerReportPost': 10000,
		'_timeSpanOfScanCachedApiStats': 1000 * 3,// milliseconds
		'_reportIntervals': 1000 * 5 // milliseconds
	},
	'api_worker_count': api_worker_count,
	'tapDataServer': {
		'url': tapdata_origin,
		'accessCode': accessCode,
	},
	'oAuthBaseUrl': oauth_base_url,

	'reportIntervals': 5000, // milliseconds
	'reportData': {
		'worker_type': 'api-server',
		'process_id': process_id
	},

	'apiCache': api_cache,
	'logDir': logDir,
	'apiFile': api_file

};

module.exports = config;
