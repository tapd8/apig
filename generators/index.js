
const log = require('../dist').log.default;
const ModelGenerator = exports.ModelGenerator = require('./model');
const DataSourceGenerator = exports.DataSourceGenerator = require('./datasource');
const RepositoryGenerator = exports.RepositoryGenerator = require('./repository');
const ControllerGenerator = exports.ControllerGenerator = require('./controller');

const deleteTs = require('./delete-ts');

// Model Property Types
const typeChoices = [
	'string',
	'number',
	'boolean',
	'array',
	'date',
	'buffer'
];
const methods = ['POST', 'GET', 'PATCH', 'DELETE'];

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
	},
		apiVersion = config.apiVersion || 'v1';

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
			if( !model.tablename ){
				log.error(`缺少数据实体名称配置（config.models[${i}].tablename）`);
				continue;
			}
			if( !model.fields ){
				log.error(`缺少数据实体字段属性配置（config.models[${i}].fields）`);
				continue;
			}
			if( !Array.isArray(model.fields) ){
				log.error(`数据实体字段属性配置必须为数组（config.models[${i}].fields）`);
				continue;
			}

			let name = model.tablename,
				fields = model.fields,
				basePath = model.basePath || model.path || name;
			let idProperty = null,
				idType = '',
				properties = {};

			// 校验转化字段配置
			fields.forEach((field, idx) => {

				let name = field['field_name'],
					isId = field['primary_key_position']=== 1,
					type = field['data_type'] || '',
					description = field['description'] || null,
					required = field['required'],
					itemType = type === 'array' ? field['itemType'] : null;

				type = type.toLowerCase();
				if( ['int', 'integer', 'long', 'double'].includes(type))
					type = 'number';

				if( !typeChoices.includes(type) ){
					log.error(`数据实体字段类型不合法（config.models[${i}].fields[${idx}].data_type）: ${type}`);
					return;
				}
				if( itemType ){
					if( ['int', 'integer', 'long', 'double'].includes(itemType))
						itemType = 'number';
					if( !typeChoices.includes(itemType) ){
						log.error(`数据实体字段类型不合法（config.models[${i}].fields[${idx}].itemType）: ${itemType}`);
						return;
					}
				}

				properties[name] = {
					type: type,
					id: isId,
					required: required === true || required === 'true',
				};

				if( type === 'array')
					properties[name]['itemType'] = itemType;
				if( description )
					properties[name]['description'] = `'${description}'`;

				if( idProperty === null && isId ){
					idProperty = name;
					idType = type;
				}
			});

			if( !idProperty ){
				log.error(`实体对象缺少唯一主键字段配置（config.models[${i}]）`);
				continue;
			}

			// 校验转化 API配置
			const api = {},
				paths = model.paths || [];

			if( basePath.startsWith('/'))
				basePath = basePath.slice(1);

			paths.forEach((item, idx) => {
				let type = item['type'],
					name = item['name'],
					path = item['path'],
					summary = item['description'],
					filter = item['filter'],
					params = item['params'],
					fields = item['fields'];

				if( type === 'custom' ){
					name = `find_${idx}`;

					if( !path || path.trim().length === 0){
						log.error(`实体api配置缺少请求路径字段（config.models[${i}].paths[${idx}].path）`);
						return;
					}
				}

				let reqPath = `/api/${apiVersion}/${basePath}`;
				if( path ){
					if( path.startsWith('/'))
						reqPath += path;
					else
						reqPath += '/' + path;
				}

				api[name] = {
					type: type,
					name: name,
					path: reqPath,
					summary: summary,
					filter: filter,
					params: params,
					fields: fields
				};
				if( Array.isArray(fields) ){
					api[name].fields = {};
					for(let i = 0; i < fields.length; i++)
						api[name].fields[fields[i]] = 1;
				}

			});

			result.models.push({
				name: name,
				properties: properties
			});

			result.repositories.push({
				name: name,
				dataSourceName: result.dataSource.name,
				idProperty: idProperty
			});

			result.controllers.push({
				name: name,
				idType: idType,
				api: api
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
