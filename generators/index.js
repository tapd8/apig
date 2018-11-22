
const log = require('../log').generator;
const utils = require('./utils');
const path = require('path');
const fs = require('fs');
const ModelGenerator = exports.ModelGenerator = require('./model');
const DataSourceGenerator = exports.DataSourceGenerator = require('./datasource');
const RepositoryGenerator = exports.RepositoryGenerator = require('./repository');
const ControllerGenerator = exports.ControllerGenerator = require('./controller');


/**
 * 检验配置合法
 */
const validateConfig = function(config){
	config = config || {};
	const result = {
		dataSource: {},
		controllers:[],
		models: [],
		repositories: []
	};

	// 检查数据源
	if( !config.dataSource )
		log.error('缺少数据源配置（config.dataSource）');
	else {
		let ds = config.dataSource;
		if( !ds.name )
			log.error('缺少数据源名称配置（config.dataSource.name）');

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
		if( !ds.settings )
			log.error('缺少数据源连接参数配置（config.dataSource.settings）');
		else
			result.dataSource = config.dataSource;
	}

	// 检查 model
	if( !config.models )
		log.error('缺少数据实体配置（config.models）');
	else {
		let models = Array.isArray(config.models) ? config.models : [config.models];

		for( let i = 0; i < models.length; i++){
			let model = models[i];
			if( !model.name ){
				log.error(`缺少数据实体名称配置（config.models[${i}].name）`);
				continue;
			}
			if( !model.properties ){
				log.error(`缺少数据实体字段属性配置（config.models[${i}].properties）`);
				continue;
			}
			if( !model.properties ){
				log.error(`数据实体字段属性配置必须为数组（config.models[${i}].properties）`);
				continue;
			}

			let name = model.name,
				properties = model.properties,
				httpPathName = model.httpPathName || model.httpPath || model.path || model.name;
			let id = null,
				idType = '';

			Object.entries(properties).forEach(([key, val]) => {
				if( id === null && ( val.id === true || val.id === 'true' )){
					id = key;
					idType = val.type
				}
			});

			if( !id ){
				log.error(`实体对象缺少唯一主键字段配置（config.models[${i}]）`);
				continue;
			}

			result.models.push({
				name: name,
				httpPathName: httpPathName,
				properties: properties
			});

			result.repositories.push({
				name: name,
				dataSourceName: result.dataSource.name,
				idProperty: id
			});

			result.controllers.push({
				name: name,
				httpPathName: httpPathName,
				idType: idType
			});
		}

		return result;
	}

};

/**
 * 删除旧文件
 */
const includeDirector = [utils.controllersDir, utils.datasourcesDir, utils.repositoriesDir, utils.modelsDir, utils.servicesDir];
const includeFileSuffix = [utils.modelSuffix, utils.dataSourceSuffix, utils.repositorySuffix, utils.controllerSuffix, '.datasource.json'];
const deleteOldTs = function(cb){
	const scanFS = require('scan-fs').create();

	let dir = `${__dirname}/../${utils.destinationRootDir}`;

	scanFS.listeners({
		'file': function(filePath, eOpts){

			const fileName = path.basename(filePath);

			if( !includeDirector.includes(path.basename(path.dirname(filePath))) )
				return;

			let suffix = fileName.slice(fileName.indexOf('.'));
			if( !includeFileSuffix.includes(suffix) && fileName !== 'index.ts' )
				return;

			log.info(`delete typescript file ${filePath}`);
			fs.unlinkSync(filePath);
		},
		'complete': function(){
			if( typeof cb === 'function' ) cb();
		}
	}).setRecursive(true)
	  .scan(dir)
};

/**
 * 根据配置生成代码
 * @param config
 */
exports.generator = async function(config){

	// 检查配置文件正确性
	const classConfig = validateConfig(config);

	if( !classConfig ){
		// 校验未通过
		return;
	}

	// 删除当前ts文件
	deleteOldTs(() => {
		console.log('删除完成');
	});

	console.log(classConfig);

	// 生成 data source
	//new DataSourceGenerator(config.dataSource);
	// 生成 model
	// 生成 repository
	// 生成 controller
	// 编译 ts
	return true;

};
