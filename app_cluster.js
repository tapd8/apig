const cluster = require('cluster');
const log = require('./dist').log.app;

let appWorker = null;

/**
 * 工作进程
 */
const workerRun = function(){
	  const appConfig = require('./config');
	  const application = require('./dist');
	  const report = require('./report');

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
		  if (result)
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
  startWorker = function(){
	  // 监听父进程消息，接收到重启指令后，重启app
	  let worker = cluster.fork();
	  worker.on('message', (event) => {
		  if( event && event.type === 'started'){
			  if( appWorker ){
				  appWorker.kill();
			  }
			  appWorker = worker;
		  }
	  });
  };

if( cluster.isMaster ){
	startWorker();
	process.on('message', (event) => {
		if( event && event.type === 'restart')
			startWorker();
	})
} else {
	workerRun();
}
