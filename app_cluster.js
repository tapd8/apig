const cluster = require('cluster');
const log = require('./dist').log.app;

let appWorker = null;

/**
 * 工作进程
 */
const workerRun = function () {
	const appConfig = require('./config');
	const application = require('./dist');
	// const report = require('./report');

	// Run the application
	const config = {
		rest: {
			port: appConfig.port || +process.env.PORT || 3030,
			host: appConfig.host || process.env.HOST || 'localhost',
			openApiSpec: {
				// useful when used with OASGraph to locate your application
				setServersFromRequest: true,
			},
		},
	};
	application.main(config, (result) => {
		if (result && typeof process.send === 'function')
			process.send({
				type: 'started',
			});
	}).catch(err => {
		log.error('Cannot start the application.', err);
		process.exit(1);
	});
},

  /**
   * 主进程
   */
	startWorker = function () {
		// 监听父进程消息，接收到重启指令后，重启app
		let worker = cluster.fork();
		worker.on('message', (event) => {
			log.debug(`which pid? app_cluster.js:43: ${process.pid} and event: ${JSON.stringify(event)}`);
			if (event && event.type === 'started') {
				if (appWorker) {
					appWorker.kill();
				}
				appWorker = worker;
				process.send({
					type: 'status',
					data: 'running'
				});
			}
		});
	};

if (cluster.isMaster) {
	log.debug(`master process.pid@app_cluster.js:53: ${process.pid}`);
	startWorker();
	process.on('message', (event) => {
		if (event && event.type === 'restart')
			startWorker();
	})
} else {
	log.debug(`slave process.pid@app_cluster.js:60: ${process.pid}`);
	workerRun();
}

