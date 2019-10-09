// const fork = require('child_process').fork;
const appConfig = require('./config');
const generator = require('./generators').generator;
const report = require('./report');
const log = require('./dist').log.app;
const datasource = require('./datasource');
const fs = require('fs');
const cpus = require('os').cpus().length;
const cluster = require('cluster');

// const getToken = require('./tapdata').getToken;
// const request = require('request');
const Conf = require('conf');
const config = new Conf();

log.info('Config file at: ', `${__dirname}/config.js`);
log.info('Current active config is: \n', appConfig);
config.clear();
config.set(appConfig);

require("./reportApiCallStats");
require("./reportApiCallStatsBatchLogic");

const name = 'api-server-' + (config.get('port') || +process.env.PORT || 3080);

const maxRestartCount = 30;

class Main {
	constructor(props) {

		/**
		 * 应用工作进程
		 * @type {ChildProcess}
		 */
		this.appWorkers = {};

		/**
		 * 配置文件变化监听进程
		 * @type {ChildProcess}
		 */
		this.configMonitor = null;

		this.workerStatus = {
			workers: null,//workers info array
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
			workers: [],
			worker_process_id: '',
			worker_process_start_time: new Date().getTime(),
			worker_process_end_time: null,
			status: 'starting'
		});
		report.setStatus({
			worker_status: this.workerStatus
		});

		// 启动 app 工作进程
		this.startApp();

		// 监听配置文件变化
		if (config.get('model') === 'cloud') {
			this.startConfigChangeMonitor();
			datasource.start();
		}

		setInterval(() => {
			Object.keys(cluster.workers).forEach(id => {
				this.appWorkers[id].worker_status = cluster.workers[id].state;
				this.appWorkers[id].pid = cluster.workers[id].process.pid;
			}, 5000);
			this.workerStatus.workers = this.appWorkers;
			report.setStatus({
				worker_status: this.workerStatus
			});
		})
	}

	/**
	 * 停止
	 */
	stop() {

		let workerIds = Object.keys(this.appWorkers || {});
		if (workerIds.length > 0) {
			workerIds.forEach(id => {
				let worker = cluster.workers[id];
				worker.kill();
				log.info(`${worker.id} worker process exited.`);
			});
			log.info(`Processes of app workers have stopped.`);
		}
		Object.assign(this.workerStatus, {
			workers: null,
			running_thread: 1,
			total_thread: 1,
			status: 'stop',
		});
		report.setStatus({
			worker_status: this.workerStatus
		});

		if (this.configMonitor) {
			this.configMonitor.stop();
			log.info('configMonitor process exited.');
		}

		datasource.stop();
	}

	forkWorker() {
		let me = this;
		cluster.setupMaster({
			exec: `${__dirname}/app.js`,
			args: process.argv.slice(2),
			silent: true
		});
		let worker = cluster.fork();
		worker.on('exit', (code, signal) => {
			log.warn('process ' + worker.id + ' exit, code is ' + code + ', signal is ' + signal)
			if( signal !== 'HUP' && code !== 0 && code !== null ){

				let restart_count = me.appWorkers[worker.id] ? me.appWorkers[worker.id].restart_count : 0;
				if ( restart_count <= maxRestartCount ) {

					log.warn('process ' + worker.id + ' exit, code is ' + code + ', signal is ' + signal + ', restart count is ' + restart_count + ', restart it.')

					me.appWorkers[worker.id] = me.appWorkers[worker.id] || {}
					me.appWorkers[worker.id].restart_count = restart_count + 1;

					setTimeout( () => { me.restartWorkerById(worker.id); }, 2000);

				} else {
					log.warn('process ' + worker.id + ' exit, code is ' + code + ', signal is ' + signal + ', restart count is ' + restart_count + ', max restart count is ' + maxRestartCount);
				}
			}

			delete me.appWorkers[worker.id];
		});
		worker.on('disconnected', (code) => {

			let restart_count = me.appWorkers[worker.id] ? me.appWorkers[worker.id].restart_count : 0;
			if ( restart_count <= maxRestartCount ) {

				log.warn('process ' + worker.id + ' disconnected, code is ' + code + ', restart count is ' + restart_count + ', restart it.')

				me.appWorkers[worker.id] = me.appWorkers[worker.id] || {}
				me.appWorkers[worker.id].restart_count = restart_count + 1;

				setTimeout( () => { me.restartWorkerById(worker.id); }, 2000);

			} else {
				log.warn('process ' + worker.id + ' disconnected, code is ' + code + ', restart count is ' + restart_count + ', max restart count is ' + maxRestartCount);
			}
		});

		worker.on('message', (msg) => {
			if (msg.type === 'status') {
				if(me.appWorkers[worker.id]){
					me.appWorkers[worker.id].restart_count = 0;
				}

				Object.keys(cluster.workers).forEach(id => {
					if( me.appWorkers[id] === worker) {
						me.appWorkers[id].worker_status = msg.data;
						me.appWorkers[id].worker_msg = msg.msg;
					}
				});
				Object.assign(this.workerStatus, {
					workers: me.appWorkers,
					status: 'running',
					exit_code: null
				});
				report.setStatus({
					worker_status: this.workerStatus
				});
			}
		});
		return worker;
	}

	/**
	 * 启动 app 进程
	 */
	startApp() {

		let workerIds = Object.keys(this.appWorkers || {});
		if (workerIds.length > 0){

			let me = this;
			workerIds.forEach( id => {
				this.restartWorkerById(id)
			});

		} else {
			const workerCount =
				appConfig.api_worker_count === 0 ? cpus : appConfig.api_worker_count;
			let me = this;

			for( let i = 0; i < workerCount; i++){

				let worker = this.forkWorker();

				this.appWorkers[worker.id] = {
					id: worker.id,
					restart_count: 0,
					worker_status: worker.state,
					worker_start_time: new Date().getTime()
				};
			}
		}
	}

	restartWorkerById(id) {
		log.info('restart worker ' + id + ', process id is ' + (cluster.workers[id] ? cluster.workers[id].process.pid : '-1'));

		let oldWorker =  this.appWorkers[id]
		if( oldWorker ){
			let workerProcess = cluster.workers[oldWorker.id]
			if( workerProcess ){
				workerProcess.destroy();

				let newWorker = this.forkWorker();
				this.appWorkers[newWorker.id] = Object.assign(oldWorker || {}, {
					id: newWorker.id,
					worker_status: newWorker.state,
					worker_start_time: new Date().getTime()
				});
			}
		}
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

					this.startApp();

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

if (config.get('model') === 'local') {
	const localConfigFilePath = config.get('apiFile');
	if (fs.existsSync(localConfigFilePath)) {
		let config = fs.readFileSync(localConfigFilePath).toString();
		config = JSON.parse(config || '{}');
		main.generator(config);
	}
}


let exitHdl = function (signal) {
	log.info("Stoping api server...");
	main.stop();
};
process.on('beforeExit', exitHdl);
