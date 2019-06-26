const fork = require('child_process').fork;
const appConfig = require('./config');
const generator = require('./generators').generator;
const report = require('./report');
const log = require('./dist').log.app;
const datasource = require('./datasource');
const fs = require('fs');

const getToken = require('./tapdata').getToken;
const request = require('request');

log.info('Config file at: ', `${__dirname}/config.js`);
log.info('Current active config is: \n', appConfig);

class Main {
	constructor(props) {

		/**
		 * 应用工作进程
		 * @type {ChildProcess}
		 */
		this.appWorker = null;

		/**
		 * 配置文件变化监听进程
		 * @type {ChildProcess}
		 */
		this.configMonitor = null;

		this.workerStatus = {
			worker_process_id: null,
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
		if( appConfig.model === 'cloud') {
			this.startConfigChangeMonitor();
			datasource.start();
		}
	}

	/**
	 * 停止
	 */
	stop() {

		if (this.appWorker) {
			this.appWorker.kill();
			log.info('app worker process exited.');
		}

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

		// if (this.appWorker)
		// 	this.appWorker.kill();

		this.appWorker = fork(`${__dirname}/app_cluster.js`, process.argv.slice(2));

		this.appWorker.on('exit', (code) => {
			Object.assign(this.workerStatus, {
				worker_process_id: '',
				worker_process_end_time: new Date().getTime(),
				status: 'stop',
				exit_code: code
			});
			report.setStatus({
				worker_status: this.workerStatus
			});
		});

		this.appWorker.on('message', (msg) => {
			if( msg.type === 'status') {
				Object.assign(this.workerStatus, {
					worker_process_id: this.appWorker.pid,
					worker_process_end_time: null,
					worker_process_start_time: new Date().getTime(),
					status: msg.data,
					exit_code: null
				});
				report.setStatus({
					worker_status: this.workerStatus
				});
			}
		})
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
	generator(config){
		log.info('publish new api');
		try {
			generator(config, (result) => {
				if (result) {
					log.info('generator code successful, restart app server.');
					this.workerStatus.status = 'restart';

					this.appWorker.send({
						type: 'restart'
					});

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

if( appConfig.model === 'local' ){
	const localConfigFilePath = appConfig.apiFile;
	if (fs.existsSync(localConfigFilePath)) {
		let config = fs.readFileSync(localConfigFilePath).toString();
		config = JSON.parse(config || '{}');
		main.generator(config);
	}
}

process.on('exit', function () {
	log.info("Stoping api server...");
	main.stop();
	log.info("api server stoped.");
});
