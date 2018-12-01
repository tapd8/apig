const log = require('./dist').log.monitor;
const request = require('request');
const appConfig = require('./config');
const hashCode = require('hashcode').hashCode;
const path = require('path');
const fs = require('fs');
const makeDir = require('make-dir');

/**
 * 最后配置信息的 hashCode，用于比较配置文件是否更新
 * @type {null}
 */
let lastHashCode = null;

/**
 * 加载配置文件
 */
const loadConfig = function() {

		log.debug('download load config from tapDataServer ' + appConfig.tapDataServer.url);
		request.get(appConfig.tapDataServer.url, function(err, response, body) {
			if( err ){
				log.error('download config fail.', err);
			} else {
				log.debug('download config success.');

				body = body.trim();
				if( !(/^\{.*\}$/.test(body) || /^\[.*\]$/.test(body))){
					log.error('the configuration file is not in the expected JSON format.', body);
					return;
				}

				//  计算 hashCode 比较是否有修改
				let newHashCode = hashCode().value(body);
				log.info(`old config hash code: ${lastHashCode}, new config hash code: ${newHashCode}`);

				if( newHashCode !== lastHashCode ){
					lastHashCode = newHashCode;

					log.info('tap data config is changed, cache remote config to local.');

					// 保存到本地缓存目录
					fs.writeFileSync(getCacheConfig(), body + "\n");

					try{
						let config = JSON.parse(body);

						// 通知配置文件更新了
						process.send({
							type: 'changed',
							data: config
						});


					} catch (e) {
						log.error('parse config error: \n',e);
					}
				}
			}
		});

		setTimeout(loadConfig, appConfig.intervals);
	},

	/**
	 * 系统启动时，初始化一些配置信息
	 * @private
	 */
	__init = function(cb){
		const localConfigFilePath = getCacheConfig();
		if( fs.existsSync( localConfigFilePath ) ){
			let config = fs.readFileSync(localConfigFilePath).toString();
			lastHashCode = hashCode().value(config.trim());
		}
		cb();
	},

	/**
	 * 获取本地缓存配置文件路径
	 */
	getCacheConfig = function(){

		if (!fs.existsSync(appConfig.cacheDir)) {
			makeDir.sync(appConfig.cacheDir);
		}

		return path.resolve(`${appConfig.cacheDir}/tap_data_server_download_config.json`);
	};

__init(() => {
	loadConfig();
});
