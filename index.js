const fork = require('child_process').fork;
const log = require('./dist').log.default ;
const generator = require('./generators').generator;

class Main{
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
	}

	/**
	 * 启动
	 */
	start(){

		// 启动 app 工作进程
		this.startApp();

		// 监听配置文件变化
		this.startConfigChangeMonitor();
	}

	/**
	 * 停止
	 */
	stop(){

		if( this.appWorker ){
			this.appWorker.kill();
			log.info('app worker process exited.');
		}

		if( this.configMonitor ){
			this.configMonitor.stop();
			log.info('configMonitor process exited.');
		}
	}

	/**
	 * 启动 app 进程
	 */
	startApp(){

		if( this.appWorker )
			this.appWorker.kill();

		this.appWorker = fork(`${__dirname}/app.js`, process.argv.slice(2));

	}

	/**
	 * 配置文件发生变化
	 */
	startConfigChangeMonitor(){
		/**
		 * 配置文件变化监听进程
		 * @type {ChildProcess}
		 */
		this.configMonitor = require('./monitor');

		this.configMonitor.on('message', (event) => {
			if( event && event.type === 'changed'){

				log.info('config is changed, regenerator api.')

				const config = event.data;

				// 生成代码
				this.generator(config);
			}
		} );
		this.configMonitor.start();
	}

	/**
	 * 生成代码
	 * @param config
	 * @private
	 */
	generator(config){
		log.info('开始生成代码');
		try {
			generator(config, (result) => {
				if( result ){
					log.info('generator code successful, restart app server.');

					this.startApp();

				} else {
					log.info('generator code fail.');
				}
			});
		} catch (e) {
			log.error('generator code fail.', e);
		}
	}

}

const main = new Main();
main.start();

const exitHandler = function(){
	log.info("Stoping api gateway...");
	main.stop();
	log.info("api gateway stoped.");
};
process.on('exit', exitHandler);
//process.on('SIGKILL', exitHandler);
require('fs').writeFileSync(`${__dirname}/server.pid`, `${process.pid}\n`, { encoding: 'utf-8'});
