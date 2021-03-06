const log = require('./dist').log.monitor;
const request = require('request');
// const appConfig = require('./config');
const hashCode = require('hashcode').hashCode;
const path = require('path');
const fs = require('fs');
const makeDir = require('make-dir');
const { getToken, removeToken } = require('./tapdata');
const tapdata = require('./tapdata');
const Conf = require('conf');
const config = new Conf();


/**
 * 最后配置信息的 hashCode，用于比较配置文件是否更新
 * @type {null}
 */
let lastHashCode = null,
	intervalId;

/**
 * 加载配置文件
 */
const
	__listeners = {},
	loadConfig = function (token) {
		const url = config.get('tapDataServer.url') + '/api/modules/apiDefinition';
		log.debug('download load config from server ' + url);
		request.get(`${url}?access_token=${token}`, function (err, response, body) {
			if (err) {
				log.error('download config fail.', err);
			} else if (response.statusCode === 401 || response.statusCode === 403) {
				console.error('Access token Expired');
				removeToken();
			} else if (response.statusCode === 200) {
				log.debug('download config success.');

				body = body.trim();
				/*if( ! (/^\{.*\}$/.test(body) || /^\[.*\]$/.test(body)) ){
					log.error('the configuration file is not in the expected JSON format.', body);
					return;
				}*/

				//  计算 hashCode 比较是否有修改
				let newHashCode = hashCode().value(body);
				// log.info(`old config hash code: ${lastHashCode}, new config hash code: ${newHashCode}`);

				if (newHashCode !== lastHashCode) {
					lastHashCode = newHashCode;

					log.info('api config is changed, cache remote config to local.');

					// 保存到本地缓存目录
					fs.writeFileSync(getCacheConfig(), body + "\n");

					try {
						let config = JSON.parse(body);

						// 通知配置文件更新了
						const msg = {
							type: 'changed',
							data: config
						};
						if (__listeners['message']) {
							__listeners['message'].forEach((l) => {
								if (typeof l === 'function')
									l(msg);
							})
						}
					} catch (e) {
						log.error('parse config error: \n', e);
					}
				}
			} else {
				log.error('get config error: \n', body);
			}
		});
	},

	/**
	 * 系统启动时，初始化一些配置信息
	 * @private
	 */
	__init = function (cb) {
		const localConfigFilePath = getCacheConfig();
		if (fs.existsSync(localConfigFilePath)) {
			let config = fs.readFileSync(localConfigFilePath).toString();
			lastHashCode = hashCode().value(config.trim());
		}
		cb();
	},

	/**
	 * 获取本地缓存配置文件路径
	 */
	getCacheConfig = function () {

		const cacheFilePath = config.get('apiCache').startsWith('/') ? config.get('apiCache') : path.join(__dirname, config.get('apiCache'));
		const dir = path.dirname(cacheFilePath);
		if (!fs.existsSync(dir)) {
			log.info(`create cache dir ${dir}`);
			makeDir.sync(dir);
		}

		return path.resolve(cacheFilePath);
	};

exports.on = function (type, listener) {
	if (!__listeners[type])
		__listeners[type] = [];
	log.info('register listener on ' + type);
	__listeners[type].push(listener);
};
exports.start = function () {
	__init(() => {
		intervalId = setInterval(() => {
			getToken(token => {
				if (token) {
					loadConfig(token);
				}
			})

		}, config.get('intervals'));
	});
};
exports.stop = function () {
	if (intervalId)
		clearInterval(intervalId);
};

tapdata.on('defaultLimit:changed', (newVal, oldVal) => {
	log.info('defaultLimit is changed, new value is ' + newVal + ' and old value is ' + oldVal);
	config.set('defaultLimit', Number(newVal) || 10);
	lastHashCode = null;//regenerate code
});
tapdata.on('maxLimit:changed', (newVal, oldVal) => {
	log.info('maxLimit is changed, new value is ' + newVal + ' and old value is ' + oldVal);
	config.set('maxLimit', Number(newVal) || 0); // 0 not max limit
	lastHashCode = null;//regenerate code
});
