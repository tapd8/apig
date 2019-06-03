//<Config at here>
const api_server_port = process.env['API_SERVER_PORT'] || '3083';
const api_server_host = process.env['API_SERVER_HOST'] || '0.0.0.0';

const tapdata_port = process.env['TAPDATA_PORT'] || '3030';
const tapdata_host = process.env['TAPDATA_HOST'] || '127.0.0.1';
const tapdata_origin = process.env['TAPDATA_ORIGIN'] || `http://${tapdata_host}:${tapdata_port}`;
const process_id = process.env['API_SERVER_ID'] || 'b5fd01c5996a634320ebf53cbab5fadf';
const accessCode = process.env['TAPDATA_ACCESS_CODE'] || 'ee40d4146e4f3bb3ec85ae4cda484199';

const jwtSecretKey = process.env['JWT_SECRET_KEY'] || '795a357ff5c2cc895b5a2b8e0a0e883a';

const cacheDir = process.env['CACHE_DIR'] || `${__dirname}/cache`;
const api_cache = process.env['API_CACHE'] || `${cacheDir}/server_api_definition.json`;
const logDir = process.env['LOG_DIR'] || `${__dirname}/cache`;
const model = process.env['MODEL'] || `cloud`;

const api_file = process.env['API_FILE'] || `api.json`;
//</Config at here>


const config = {
	'model': `${model}`,
	'version': 'v1.0.0-0-gd48b0c9',
	'intervalsDesc': 'The intervals to check the api definition, unit is milliseconds.',
	'intervals': 5000,
	'host': api_server_host,
	'port': api_server_port,
	'tapDataServer': {
		'url': `${tapdata_origin}/api/apiModules`,
		'tokenUrl': `${tapdata_origin}/api/users/generatetoken`, // url to get token by accessCode
		'reportUrl': `${tapdata_origin}/api/Workers/upsertWithWhere`,
		'logUrl': `${tapdata_origin}/api/Logs`,
		'connectionUrl': `${tapdata_origin}/api/Connections`,
		'accessCode': accessCode,
	},

	'reportIntervals': 5000, // milliseconds
	'reportData': {
		'worker_type': 'api-server',
		'process_id': process_id,
	},

	'apiCache': api_cache,
	'logDir': logDir,
	'apiFile': api_file,

	'jwtSecretKey': jwtSecretKey,
};

module.exports = config;
