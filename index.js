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
			this.configMonitor.kill();
			log.info('configMonitor process exited.');
		}
	}

	/**
	 * 启动 app 进程
	 */
	startApp(){

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

				log.info('config is changed, regenerator api.')

				const config = event.data;

				// 生成代码
				this.generator(config);
			}
		} );
	}

	/**
	 * 生成代码
	 * @param config
	 * @private
	 */
	generator(config){
		log.info('开始生成代码');
		generator(config, (result) => {
			if( result ){
				log.info('生成代码完成，重启应用');

				this.appWorker.send({
					type: 'restart'
				});

			} else {
				log.info('生成代码失败');
			}
		});
	}

}

const main = new Main();
main.start();
process.on('exit',function(){
	main.stop();
});