//<Config at here>
const api_server_port = process.env['API_SERVER_PORT'] || '3080';            // this is api-server port
const tapdata_port = process.env['TAPDATA_PORT'] || '';                      // this is moa server port
const tapdata_host = process.env['TAPDATA_HOST'] || 'openapi.mongodb.expert';// this is moa server ip
const tapdata_origin = process.env['TAPDATA_ORIGIN'] || 'http://openapi.mongodb.expert';
const process_id = process.env['API_SERVER_ID'] || 'd145d3b72b33a1db7515e647d5818600';  // this is api-server unique id
const accessCode = process.env['TAPDATA_ACCESS_CODE'] || 'ee40d4146e4f3bb3ec85ae4cda484199';    // this is access to moa code
const jwtSecretKey = process.env['JWT_SECRET_KEY'] || 'de428370350427d6f9102b12a36c8c45';       // this is jwt secret key
//</Config at here>


const config = {
	'version': 'v1.0.0-0-gd48b0c9',
	'intervalsDesc': 'The intervals to check the api definition, unit is milliseconds.',
	'intervals': 5000,
	'host': '0.0.0.0',
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

	'cacheDir': 'cache',
	'logDir': 'logs',

	'jwtSecretKey': jwtSecretKey,
};

module.exports = config;

