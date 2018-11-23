
const path = require('path');
const spawn = require('cross-spawn');
const log = require('../dist').log.generator;

module.exports = function(cb){

	const opts = {
		cwd: path.dirname(__dirname)
	};

	let cleanResult = spawn.sync('npm', ['run', 'clean'], opts);
	log.info('\n' + cleanResult.stdout);
	if( cleanResult.status > 0)
		log.error('\n' + cleanResult.stderr);


	let buildResult = spawn.sync('npm', ['run', 'build'], opts);
	log.info('\n' + buildResult.stdout);
	if( buildResult.status > 0 )
		log.error('\n' + buildResult.stderr);

	if( cleanResult.status === 0 && buildResult.status === 0)
		cb( true );
	else
		cb( false );
};