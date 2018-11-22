const fork = require('child_process').fork;
const log = require('./log');
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
			this.configMonitor.kill();
			log.info('configMonitor process exited.');
		}
	}

	/**
	 * 启动 app 进程
	 */
	startApp(){

		if( this.appWorker )
			this.appWorker.kill();

		this.appWorker = fork(`${__dirname}/app.js`);

	}

	/**
	 * 配置文件发生变化
	 */
	startConfigChangeMonitor(){
		/**
		 * 配置文件变化监听进程
		 * @type {ChildProcess}
		 */
		this.configMonitor = fork(`${__dirname}/monitor.js`);

		this.configMonitor.on('message', (event) => {
			if( event && event.type === 'changed'){

				const config = event.data;
				log.info('tap data config is changed');

				// 生成代码
				this.__generator(config);
			}
		} );
	}

	/**
	 * 生成代码
	 * @param config
	 * @private
	 */
	__generator(config){
		generator(config, (result) => {
			if( result )
				this.startApp();
		});
	}

}

const main = new Main();
main.start();
process.on('exit',function(){
	main.stop();
});