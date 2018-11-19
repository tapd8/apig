const log = require('./log').monitor;
const request = require('request');
const appConfig = require('./config');
const hashCode = require('hashcode').hashCode;

let lastHashCode = null;
const loadConfig = function() {

	log.info('download load config from tapDataServer ' + appConfig.tapDataServer.url);
	request.get(appConfig.tapDataServer.url, function(err, response, body) {
		if( err ){
			log.error('download config fail.', err);
		} else {
			log.debug('download config success.');

			//  计算 hashCode 比较是否有修改
			let newHashCode = hashCode().value(body);
			log.info(`old config hash code: ${lastHashCode}, new config hash code: ${newHashCode}`);

			if( newHashCode !== lastHashCode ){
				lastHashCode = newHashCode;
				try{
					let config = JSON.parse(body);

					// 通知配置文件更新了
					process.send(config);

				} catch (e) {
					log.error('parse config error: \n',e);
				}
			}
		}
	});

	setTimeout(loadConfig, appConfig.intervals);
};

loadConfig();
