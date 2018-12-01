const log = require('../dist').log.generator;

const dataTypes = {
	'ObjectId': 'string',
	'String': 'string',
	'Boolean': 'boolean',
	'Integer': 'number'
};

/**
 * 将 tab data server 配置转化为 config
 * @param models
 */
module.exports = function(models){

	if( !models )
		return null;

	if( !Array.isArray(models) ){
		log.error('配置文件不是预期的数据');
		return null;
	}

	const result = {
		dataSource: [],
		models: []
	};

	const dataSource = {};

	models.forEach((model) => {

		let modelConf = {
			apiVersion: model.apiVersion || 'v1',
			tablename: model.tablename,
			dataSourceName: model.connection.name,
			basePath: model.basePath,
			description: model.description,
			fields: [],
			paths: []
		};

		model.fields.forEach((field)=>{
			modelConf.fields.push({
				field_name: field.field_name,
				data_type: dataTypes[field.data_type] || 'string',
				primary_key_position: field.primary_key_position
			})
		});
		model.paths.forEach((customApi) => {
			let apiConfig = {
				type: customApi.type,
				description: customApi.description || ''
			};
			if( apiConfig.type === 'preset' ){
				apiConfig.name = customApi.name;
			} else {
				if( customApi.fields && customApi.fields.length > 0){
					apiConfig.fields = [];
					customApi.fields.forEach((field) => {
						apiConfig.fields.push(field.field_name);
					});
				}

				// 预设过滤条件
				if( customApi.condition ){
					let and = [];
					let last = null;
					for( let i = 0; i < customApi.condition.length; i++ ){
						if( !last ){
							last = customApi.condition[i];
						} else {
							let current = customApi.condition[i];
							if( current.relation === '||' ){
								let a = {}, b = {};
								a[last['column']] = last['value'];
								b[current['column']] = current['value'];
								and.push({'$or': [a, b]});

								last = null;
							} else {
								let a = {};
								a[last['column']] = last['value'];
								and.push(a);

								last = current;
							}
						}
					}
					if( last ){
						let a = {};
						a[last['column']] = last['value'];
						and.push(a);
					}

					if( and.length > 0 )
						apiConfig.filter = and;
				}

				apiConfig.path = customApi.path;
			}
			modelConf.paths.push(apiConfig);
		});

		result.models.push(modelConf);

		dataSource[model.connection.name] = {
			name: model.connection.name,
			settings: {
				url: model.connection.database_uri,
				host: model.connection.database_host,
				port: model.connection.database_port,
				user: model.connection.database_username,
				password: model.connection.database_password,
				database: model.connection.database_name,
			}
		};

	});

	Object.entries(dataSource).forEach(([dataSourceName, dbConf])=> {
		result.dataSource.push(dbConf);
	});

	return result;

};
