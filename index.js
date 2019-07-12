const fork = require('child_process').fork;
const appConfig = require('./config');
const generator = require('./generators').generator;
const report = require('./report');
const log = require('./dist').log.app;
const datasource = require('./datasource');
const fs = require('fs');

const getToken = require('./tapdata').getToken;
const request = require('request');
const pm2 = require('pm2');

log.info('Config file at: ', `${__dirname}/config.js`);
log.info('Current active config is: \n', appConfig);

class Main {
	constructor(props) {

		/**
		 * 应用工作进程
		 * @type {ChildProcess}
		 */
		// this.appWorker = null;

		/**
		 * 配置文件变化监听进程
		 * @type {ChildProcess}
		 */
		this.configMonitor = null;

		this.workerStatus = {
			workers: null,//workers info array
			worker_process_id: null, //pm2 pid
			worker_process_start_time: null,
			worker_process_end_time: null,
			status: 'stop',
			exit_code: null
		}
	}

	/**
	 * 启动
	 */
	start() {

		Object.assign(this.workerStatus, {
			worker_process_id: '',
			worker_process_start_time: new Date().getTime(),
			status: 'starting'
		});
		report.setStatus({
			worker_status: this.workerStatus
		});

		// 启动 app 工作进程
		this.startApp();

		// 监听配置文件变化
		if (appConfig.model === 'cloud') {
			this.startConfigChangeMonitor();
			datasource.start();
		}
	}

	/**
	 * 停止
	 */
	stop() {

		// if (this.appWorker) {
		// 	this.appWorker.kill();
		// 	log.info('app worker process exited.');
		// }

		pm2.stop("api-server", (err, wks) => {

			log.info(`Processes of app workers have stopped.`);

			pm2.list((err, plist) => {
				// console.log(plist);

				Object.assign(main.workerStatus, {
					workers: plist,
					running_thread: 2,
					total_thread: plist.length + 2,
					status: 'stop',
				});
				report.setStatus({
					worker_status: main.workerStatus
				});

			});

		});


		if (this.configMonitor) {
			this.configMonitor.stop();
			log.info('configMonitor process exited.');
		}

		datasource.stop();
	}

	/**
	 * 启动 app 进程
	 */
	startApp() {

		pm2.connect(function (err) {
			if (err) {
				console.error(err);
				process.exit(2);
			}

			pm2.stop("api-server", (err) => {

				pm2.start({
					name: "api-server",
					script: 'app.js',         // Script to be run
					args: process.argv.slice(2),
					exec_mode: 'cluster',        // Allows your app to be clustered
					instances: appConfig.api_worker_count,
					logDateFormat: "YYYY-MM-DD HH:mm:ss"
					// max_memory_restart: '100M'   // Optional: Restarts your app if it reaches 100Mo
				}, function (err, apps) {

					pm2.list((err, plist) => {
						// console.log(plist);

						Object.assign(main.workerStatus, {
							workers: plist,
							running_thread: plist.length + 2,
							total_thread: plist.length + 2,
							worker_process_id: (fs.readFileSync(pm2.Client.conf.PM2_PID_FILE_PATH, 'utf-8')),
							worker_process_end_time: null,
							worker_process_start_time: new Date().getTime(),
							status: 'running',
							exit_code: null
						});
						report.setStatus({
							worker_status: main.workerStatus
						});

						pm2.disconnect();   // Disconnects from PM2
					});

					if (err) throw err
				});

			});

		});



		// if (this.appWorker)
		// 	this.appWorker.kill();

		// this.appWorker = fork(`${__dirname}/app_cluster.js`, process.argv.slice(2));

		// this.appWorker.on('exit', (code) => {
		// andy:here is not stop logic,but update logic,refactor, 2019-7-9
		// 	Object.assign(this.workerStatus, {
		// 		worker_process_id: '',
		// 		worker_process_end_time: new Date().getTime(),
		// 		status: 'stop',
		// 		exit_code: code
		// 	});
		// 	report.setStatus({
		// 		worker_status: this.workerStatus
		// 	});
		// });

		// this.appWorker.on('message', (msg) => {
		// 	if (msg.type === 'status') {
		// 		Object.assign(this.workerStatus, {
		// 			worker_process_id: this.appWorker.pid,
		// 			worker_process_end_time: null,
		// 			worker_process_start_time: new Date().getTime(),
		// 			status: msg.data,
		// 			exit_code: null
		// 		});
		// 		report.setStatus({
		// 			worker_status: this.workerStatus
		// 		});
		// 	}
		// })
	}

	/**
	 * 配置文件发生变化
	 */
	startConfigChangeMonitor() {
		/**
		 * 配置文件变化监听进程
		 * @type {ChildProcess}
		 */
		this.configMonitor = require('./monitor');

		this.configMonitor.on('message', (event) => {
			if (event && event.type === 'changed') {

				log.info('config is changed, regenerator api.')

				const config = event.data;

				// 生成代码
				this.generator(config);
			}
		});
		this.configMonitor.start();
	}

	/**
	 * 生成代码
	 * @param config
	 * @private
	 */
	generator(config) {
		log.info('Generating new api codes...');
		try {
			generator(config, (result) => {
				if (result) {
					log.info('generator code successful, restart app server.');
					this.workerStatus.status = 'restart';

					pm2.reload("api-server", (err, apps) => {

						pm2.list((err, plist) => {
							// console.log(plist);

							Object.assign(main.workerStatus, {
								workers: plist,
								running_thread: plist.length + 2,
								total_thread: plist.length + 2,
								status: 'running',
							});
							report.setStatus({
								worker_status: main.workerStatus
							});

							// pm2.disconnect();   // Disconnects from PM2
						});

					});

					// this.appWorker.send({
					// 	type: 'restart'
					// });

					// this.startApp();
				} else {
					log.info('generator code fail.');
					this.workerStatus.status = 'deploy_fail';
				}

				report.setStatus({
					worker_status: this.workerStatus
				});
			});

			this.workerStatus.status = 'deploying';
			report.setStatus({
				worker_status: this.workerStatus
			});
		} catch (e) {
			log.error('generator code fail.', e);
			this.workerStatus.status = 'deploy_fail';
			report.setStatus({
				worker_status: this.workerStatus
			});
		}
	}

}

const main = new Main();
main.start();

if (appConfig.model === 'local') {
	const localConfigFilePath = appConfig.apiFile;
	if (fs.existsSync(localConfigFilePath)) {
		let config = fs.readFileSync(localConfigFilePath).toString();
		config = JSON.parse(config || '{}');
		main.generator(config);
	}
}


let exitHdl = function (signal) {
	log.info("Stoping api server...");
	main.stop();
	// log.info("api server stoped.");
	// if ('SIGINT' == signal) {
	// 	console.log('Received SIGINT. Press Control-D to exit.');
	// }
};

// process.on('exit', exitHdl);
process.on('beforeExit', exitHdl);
// process.on('SIGINT', exitHdl);
