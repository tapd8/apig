const mongodb = require('mongodb');
const log = require('../dist').log.generator;
const ModelGenerator = exports.ModelGenerator = require('./model');
const DataSourceGenerator = exports.DataSourceGenerator = require('./datasource');
const RepositoryGenerator = exports.RepositoryGenerator = require('./repository');
const ControllerGenerator = exports.ControllerGenerator = require('./controller');
const adapterTapDataConfig = require('./tapDataConfigAdapter');
const appConfig = require('../config');

const deleteTs = require('./delete-ts');

// Model Property Types
const typeChoices = [
	'string',
	'number',
	'boolean',
	'array',
	'date',
	'buffer',
	'object',
];
const methods = ['POST', 'GET', 'PATCH', 'DELETE'];

/**
 * 检验配置合法
 */
const validateConfig = function (config) {
	config = config || {};
	const result = {
		dataSource: {},
		controllers: [],
		models: [],
		repositories: []
	};

	// 检查数据源
	if (!config.dataSource) {
		log.error('Missing data source config.（config.dataSource）');
		return null;
	}
	if (!Array.isArray(config.dataSource)) {
		log.error('Invalid data source config, must be array data type.（config.dataSource）');
		return null;
	} else {
		for (let i = 0; i < config.dataSource.length; i++) {
			let ds = config.dataSource[i];
			if (!ds.name) {
				log.error(`Missing data source name.（config.dataSource[${i}].name）`);
				return null;
			}

			/**
			 * {
			 * 	"url": "mongodb://localhost:27017/test",
			 * 	"host": "localhost",
			 * 	"port": 27017,
			 * 	"user": "",
			 * 	"password": "",
			 * 	"database": "test"
			 * }
			 * 优先使用url，如果url为空按如下格式拼接连接串
			 * [protocol] + '://' + [username|user] + ':' + [password] + '@' + [hostname|host] + ':' + [port] + '/' + [database|db]
			 */
			if (!ds.settings) {
				log.error(`Missing data source parameter config（config.dataSource[${i}].settings）`);
				return null;
			}

			if (ds.settings.hasOwnProperty('url') && ds.settings.url) {
				delete ds.settings.user;
				delete ds.settings.password;
				delete ds.settings.host;
				delete ds.settings.port;
				delete ds.settings.database;
			}

			result.dataSource[ds.name] = config.dataSource[i];
		}
	}

	// 检查 model
	if (!config.models) {
		log.error('Missing model config（config.models）');
		return null;
	} else {
		let models = Array.isArray(config.models) ? config.models : [config.models];

		for (let i = 0; i < models.length; i++) {
			let model = models[i];
			if (!model.tablename) {
				log.error(`Missing model name config.（config.models[${i}].tablename）`);
				return null;
			}
			if (!model.fields) {
				log.error(`Missing model field config.（config.models[${i}].fields）`);
				return null;
			}
			if (!Array.isArray(model.fields)) {
				log.error(`Invalid model field config, must be array data type.（config.models[${i}].fields）`);
				return null;
			}
			if (!model.dataSourceName) {
				log.error(`Model lacks data source name config.（config.models[${i}].dataSourceName）`);
				return null;
			}
			if (!result.dataSource[model.dataSourceName]) {
				log.error(`Invalid model data source config, not found data source by name.（config.models[${i}].dataSourceName）:${model.dataSourceName}`);
				return null;
			}

			let name = model.basePath,
				tableName = model.tablename,
				apiId = model.apiId,
				fields = model.fields,
				basePath = model.basePath || model.path || name,
				dataSourceName = model.dataSourceName,
				dataSource = model.dataSource,
				apiVersion = model.apiVersion || 'v1';
			let idProperty = null,
				idType = '',
				properties = {};

			// 校验转化字段配置
			fields.forEach((field, idx) => {

				let name = field['field_name'],
					field_alias = field['field_alias'] || '',
					isId = field['primary_key_position'] === 1,
					type = field['data_type'] || '',
					description = field['description'] || null,
					required = field['required'],
					itemType = type === 'array' ? (field['itemType'] || 'any') : null;

				type = type.toLowerCase();
				if (['int', 'integer', 'long', 'double'].includes(type))
					type = 'number';
				else if (itemType === 'any')
					itemType = 'object';

				if (!typeChoices.includes(type)) {
					log.error(`Invalid model field data type.（config.models[${i}].fields[${idx}].data_type）: ${type}`);
					return;
				}
				if (itemType) {
					if (['int', 'integer', 'long', 'double'].includes(itemType))
						itemType = 'number';
					else if (itemType === 'any')
						itemType = 'object';
					if (!typeChoices.includes(itemType)) {
						log.error(`Invalid model field data type.（config.models[${i}].fields[${idx}].itemType）: ${itemType}`);
						return;
					}
				}

				properties[name] = {
					type: type,
					id: isId,
					required: required === true || required === 'true',
					alias: field_alias
				};

				if (type === 'array')
					properties[name]['itemType'] = itemType;
				if (description)
					properties[name]['description'] = `'${description}'`;

				if (idProperty === null && isId) {
					idProperty = name;
					idType = type;
				}
			});

			if (!idProperty) {
				log.error(`Model missing primary key.（config.models[${i}], ${name}）`);
				continue;
			}

			// 校验转化 API配置
			const api = {},
				paths = model.paths || [];

			if (basePath.startsWith('/'))
				basePath = basePath.slice(1);

			paths.forEach((item, idx) => {
				let type = item['type'],
					name = item['name'],
					path = item['path'],
					summary = item['description'],
					filter = item['filter'],
					params = item['params'],
					fields = item['fields'],
					roles = item['roles'],
					availableQueryField = item.availableQueryField || [],
					requiredQueryField = item.requiredQueryField || [];


				if (type === 'custom') {
					name = `findPage_${idx}`;

					if (!path || path.trim().length === 0) {
						log.error(`Invalid model api config, missing path.（config.models[${i}].paths[${idx}].path）`);
						return;
					}
				}

				let reqPath = `/api/${apiVersion}/${basePath}`;
				if (path) {
					if (path.startsWith('/'))
						reqPath = path;
					else
						reqPath += '/' + path;
				}

				api[name] = {
					allPathId: item["allPathId"],
					pathTpl: item.pathTpl,
					method: item.method,
					rawName: item.rawName,
					result: item.result,
					description: item.description || '',
					type: type,
					name: name,
					path: reqPath,
					summary: summary,
					filter: filter,
					params: params,
					availableQueryField: availableQueryField,
					requiredQueryField: requiredQueryField,
					//fields: fields,
					roles: roles || []
				};
				if (Array.isArray(fields) && fields.length > 0) {
					api[name].fields = {};
					for (let i = 0; i < fields.length; i++)
						api[name].fields[fields[i]] = 1;
				}

			});

			const downloadApi = tableName.endsWith('.files');
			let bucketName = 'fs';
			if (downloadApi) {
				let reqPath = `/api/${apiVersion}/${basePath}/download`;
				let roles = api['findPage'].roles;
				api['downloadById'] = {
					type: 'preset',
					name: 'downloadById',
					path: reqPath,
					summary: 'download file by id',
					//filter: filter,
					//params: params,
					//fields: fields,
					roles: roles || []
				};
				api['download'] = {
					type: 'preset',
					name: 'download',
					path: reqPath,
					summary: 'download file by filter, only return first file if find multi file',
					//filter: filter,
					//params: params,
					//fields: fields,
					roles: roles || []
				};
				bucketName = tableName.substring(0, tableName.indexOf('.files'));

			}

			result.models.push({
				name: name,
				tableName: tableName,
				apiId: apiId,
				properties: properties,
				downloadApi: downloadApi,
				bucketName: bucketName,
				dataSourceName: dataSourceName
			});

			result.repositories.push({
				name: name,
				modelName: name,
				tableName: tableName,
				apiId: apiId,
				dataSourceName: dataSourceName,
				idProperty: idProperty,
				downloadApi: downloadApi,
				bucketName: bucketName
			});

			result.controllers.push({
				name: name + '_' + (model.apiVersion || 'v1'),
				modelName: name,
				repositoryName: name,
				tableName: tableName,
				apiId: apiId,
				idType: idType,
				api: api,
				downloadApi: downloadApi,
				bucketName: bucketName,
				dataSourceName: dataSourceName
			});
		}

		return result;
	}

};

/**
 * 生成代码
 * @private
 */
const _generator = function (classConfig, cb) {

	// 生成 data source
	// 生成 model
	// 生成 repository
	// 生成 controller

	let padding = 0;

	let finish = function(){
		padding--;
		log.debug('padding write file ' + padding);
		if( padding === 0 && typeof cb === 'function'){
			cb(true);
		}
	};
	if(Object.entries(classConfig.dataSource).length === 0){
		padding++;
		finish();
		return;
	}
	Object.entries(classConfig.dataSource).forEach(([dataSourceName, dataSourceConfig]) => {
		padding++;
		new DataSourceGenerator(dataSourceConfig).on('done', finish);
	});
	classConfig.models.forEach((model) => {
		padding++;
		new ModelGenerator(model).on('done', finish);
	});
	classConfig.repositories.forEach((repository) => {
		padding++;
		new RepositoryGenerator(repository).on('done', finish);
	});
	classConfig.controllers.forEach((controller) => {
		padding++;
		controller.appConfig = appConfig;
		new ControllerGenerator(controller).on('done', finish);
	});

};

/**
 * 测试连接是否可用
 * @param config
 * @param cb
 */
const testConnection = function(config, cb){

	if( config && config.dataSource ){
		const dsNames = Object.keys(config.dataSource);

		if( dsNames.length === 0 ) {
			cb(config);
			return;
		}
		let padding = 0;
		const finish = function(dataSourceName, result){

			// connection unavailable, remove dataSource and api
			if( !result){
				delete config.dataSource[dataSourceName];
				for ( let i = 0; i < config.models.length; i++){
					if( config.models[i].dataSourceName === dataSourceName){
						config.models.splice(i, 1);
						i--;
					}
				}
				for ( let i = 0; i < config.controllers.length; i++){
					if( config.controllers[i].dataSourceName === dataSourceName){
						config.controllers.splice(i, 1);
						i--;
					}
				}
				for ( let i = 0; i < config.repositories.length; i++){
					if( config.repositories[i].dataSourceName === dataSourceName){
						config.repositories.splice(i, 1);
						i--;
					}
				}
			}

			padding--;
			if( padding === 0 ){
				cb(config);
			}
		};
		dsNames.forEach(dataSourceName => {
			padding++;

			let ds = config.dataSource[dataSourceName];
			let url = ds.settings.url || '';

			if( url ){
				new mongodb.MongoClient(url, { useNewUrlParser: true }).connect((err, client) => {
					if( err ){
						log.error("DataSource connection is unavailable " + url, err);
						finish(dataSourceName, false);
					} else {
						log.info("Connect DataSource successful");
						finish(dataSourceName, true);
					}
				})
			} else {
				finish(dataSourceName, false);
			}

		});
	} else {
		cb(config);
	}
};

const build = require('./build');

/**
 * 根据配置生成代码
 * @param config
 */
exports.generator = function (config, cb) {

	/**
	 * 适配接口返回数据
	 */
	config = adapterTapDataConfig(config);
	if( config === null){
		cb(false);
		return;
	}

	// 检查配置文件正确性
	const classConfig = validateConfig(config);

	if (!classConfig) {
		// 校验未通过
		cb(false);
		return;
	}

	// test connection and remove unavailable connect
	testConnection(classConfig, (classConfig) => {
		// 删除当前ts文件
		deleteTs((result) => {
			if (result) {
				log.info('delete old api source code.');
				_generator(classConfig, (result) => {
					if (result) {
						log.info('generator api source code done.');
						build((result) => {
							if (result) {
								log.info('complied.');
								cb(true);
							} else {
								log.error('generator api source code fail, cancel updated.');
								cb(false);
							}
						});
					} else {
						log.error('generator api source code fail, cancel update.');
						cb(false);
					}
				});
			} else {
				log.error('delete old api source code fail, cancel update.');
				cb(false);
			}
		});
	});

};
