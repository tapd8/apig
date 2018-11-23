
const log = require('../dist').log.default;
const ModelGenerator = exports.ModelGenerator = require('./model');
const DataSourceGenerator = exports.DataSourceGenerator = require('./datasource');
const RepositoryGenerator = exports.RepositoryGenerator = require('./repository');
const ControllerGenerator = exports.ControllerGenerator = require('./controller');

const deleteTs = require('./delete-ts');

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
 * 生成代码
 * @private
 */
const _generator = function(classConfig, cb){

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
	padding++;
	new DataSourceGenerator(classConfig.dataSource).on('done', finish);
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
		new ControllerGenerator(controller).on('done', finish);
	});

};

const build = require('./build');

/**
 * 根据配置生成代码
 * @param config
 */
exports.generator = function(config, cb){

	// 检查配置文件正确性
	const classConfig = validateConfig(config);

	if( !classConfig ){
		// 校验未通过
		cb(false);
		return;
	}

	// 删除当前ts文件
	deleteTs((result) => {
		if( result ){
			log.info('delete old api source code.');
			_generator(classConfig, (result) => {
				if( result ){
					log.info('generator api source code done.');
					build((result) => {
						if( result ){
							log.info('complied.');
							cb(true);
						} else {
							log.error('generator api source code fail, cancel updated.');
						}
					});
				} else {
					log.error('generator api source code fail, cancel update.');
					cb(false);
				}
			});
		} else{
			log.error('delete old api source code fail, cancel update.');
			cb(false);
		}
	});

};
