//<Config at here>
const api_server_port = process.env['API_SERVER_PORT'] || '3080'; //this api-server port
const tapdata_port = process.env['TAPDATA_PORT'] || '3030';  //tapdata server port
const tapdata_host = process.env['TAPDATA_HOST'] || '127.0.0.1';  //tapdata server ip
const tapdata_origin = process.env['TAPDATA_ORIGIN'] || `http://${tapdata_host}:${tapdata_port}`;
const process_id = process.env['API_SERVER_ID'] || 'd2f1cc40-552a-11e9-8ff4-059b83989412';
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
		'reportUrl':  `${tapdata_origin}/api/Workers/upsertWithWhere`,
		'logUrl': `${tapdata_origin}/api/Logs` ,
		'accessCode': 'bd16c77a-2111-499c-b2ae-a35c587ea83a',
	},

	'reportIntervals': 5000, // milliseconds
	'reportData': {
		'worker_type': 'api-server',
		'process_id':  process_id
	},

	'cacheDir': 'cache',
	'logDir': 'logs',

	'jwtSecretKey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
};

module.exports = config;
