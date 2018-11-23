
const path = require('path');
console.log(path.dirname(__dirname));

const spawn = require('cross-spawn');

let result = spawn.sync('npm', ['run', 'clean']);
if( result.stdout )
	console.log('out \n' + result.stdout);
if( result.stderr)
	console.log('err \n' + result.stderr);

result = spawn.sync('npm', ['run', 'build'], { stdio: 'inherit' });
if( result.stdout )
	console.log('out \n' + result.stdout);
if( result.stderr)
	console.log('err \n' + result.stderr);

