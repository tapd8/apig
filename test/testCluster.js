/**
 * @author lg<lirufei0808@gmail.com>
 * @date 9/12/19
 * @description
 */
const cluster = require('cluster');
const workers = [];
const startWorker = function(){
	let worker = cluster.fork();
	workers.push(worker);

	worker.on('exit', function(){
		console.log('worker process exit.')
	});
};

const workerRun = function(){
	const express = require('express');
	const app = express();

	app.get('/', function (req, res) {
		res.send('Hello World')
	});

	app.listen(3001);

	console.log('worker started.')
};

if (cluster.isMaster) {

	console.log(`master process ${process.pid}`);

	let workerCount = require('os').cpus().length;

	for (let i = 0; i < workerCount; i++) {
		startWorker();
	}

	setInterval(() => {
		console.log(workers);
	}, 2000)

} else {
	console.log(`slave process ${process.pid}`);
	workerRun();
}
