//<Config at here>
const api_server_port = process.env['API_SERVER_PORT'] || '3080'; //this api-server port
const tapdata_port = process.env['TAPDATA_PORT'] || '3030';  //tapdata server port
const tapdata_host = process.env['TAPDATA_HOST'] || '127.0.0.1';  //tapdata server ip
const tapdata_origin = process.env['TAPDATA_ORIGIN'] || `http://${tapdata_host}:${tapdata_port}`;
const process_id = process.env['API_SERVER_ID'] || '40a8d2c392f810289820ee574bdb345a-52c41659202060d7d76eee3bf8f5f28f';
const accessCode = process.env['TAPDATA_ACCESS_CODE'] || 'ee40d4146e4f3bb3ec85ae4cda484199';
const jwtSecretKey = process.env['JWT_SECRET_KEY'] || '9b6ccfd8a27507d217684a581c0644e9';
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
		'connectionUrl': `${tapdata_origin}/api/Connections` ,
		'accessCode': accessCode,
	},

	'reportIntervals': 5000, // milliseconds
	'reportData': {
		'worker_type': 'api-server',
		'process_id':  process_id
	},

	'cacheDir': 'cache',
	'logDir': 'logs',

	'jwtSecretKey': jwtSecretKey,
};

module.exports = config;
