const fork = require('child_process').fork;
const log = require('./log');

const configMonitor = fork(`${__dirname}/monitor.js`);

configMonitor.on('message', (m) => {
	log.info('tap data config is changed\n', JSON.stringify(m, null, '\t'));

	// 根据配置文件生成代码

	// 运行 app

} );