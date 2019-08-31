const log = require('../dist').log.generator;

const {APIDefineDataTypeToModel} = require('./data-type-mapping');

const convertCondition = function(cond){

	// JugglingDB
	// and: '并列条件',  or: '可选条件', gt: '>', gte: '>=', ne: '!=', lt: '<', lte: '<=', like: 'LIKE', nlike: 'NOT LIKE', inq: 'IN', nin: 'NOT IN'

	const
	  operation = cond['operation'],	// 1:<=   2:<   3:>=   4:>   5:!=   6:==   7:like   8:not like
	  fieldName = cond['column'],
	  value = cond['value'];

	if( !fieldName || !value || !operation)
		return {};

	let result = {};
	let spec = null;
	switch ( operation ) {
		case 1:
			spec = 'let';
			break;
		case 2:
			spec = 'lt';
			break;
		case 3:
			spec = 'gte';
			break;
		case 4:
			spec = 'gt';
			break;
		case 5:
			spec = 'ne';
			break;
		case 6:
			result[fieldName] = value;
			return result;
		case 7:
			result[fieldName] = new RegExp(value);
			return result;
		case 8:
			result[fieldName] = {
				'not': new RegExp(value)
			};
			return result;
	}
	if( spec ){
		result[fieldName] = {};
		result[fieldName][spec] = value;
		return result;
	} else {
		result[fieldName] = value;
		return result;
	}
},
  buildQuery = function(filter){
	let query = {};
	if( Array.isArray(filter.items) ){
		if( filter.relation ){

			let relationName = filter.relation === '&&' ? 'and' : 'or';
			query[relationName] = [];
			filter.items.forEach((f) => {
				query[relationName].push(buildQuery(f));
			});

		} else {
			filter.items.forEach((f) => {
				Object.assign(query, buildQuery(f));
			});
		}
	} else if(filter.column && filter.value && filter.operation){
		Object.assign(query, convertCondition(filter));
	}
	return query;
  };

/**
 * 将 tab data server 配置转化为 config
 * @param apiDefinition
 */
module.exports = function(apiDefinition){

	if( !apiDefinition ){
		log.warn('none api to publish');
		return null;
	}

	if( !apiDefinition.apis || !apiDefinition.connections ){
		log.error('配置文件不是预期的数据');
		return null;
	}

	const result = {
		dataSource: [],
		models: []
	};

	const dataSource = {};

	apiDefinition.connections.forEach( connection => {
		dataSource[connection.id] = {
			name: connection.name || `_${connection.id}`,
			settings: {
				url: decodeURI(connection.database_uri),
				host: connection.database_host,
				port: connection.database_port,
				user: connection.database_username,
				password: connection.database_password,
				database: connection.database_name,
			}
		};
	});

	apiDefinition.apis.forEach((model) => {

		if( !dataSource[model.datasource] ){
			log.error('Not found model(' + model.tablename + ') dataSource(' + model.datasource + ')');
		} else {
			let modelConf = {
				apiVersion: model.apiVersion || 'v1',
				tablename: model.tablename,
				dataSourceName: dataSource[model.datasource].name,
				dataSource: model.datasource,
				apiId: model.id,
				basePath: model.basePath,
				description: model.description,
				fields: [],
				paths: []
			};

			model.fields.forEach((field)=>{
				if( field.field_name.indexOf('.') !== -1){
					return ;
				}
				let conf = {
					field_name: field.field_name,
					field_alias: field.field_alias || '',
					data_type: APIDefineDataTypeToModel[field.node_data_type || field.data_type] || 'string',
					primary_key_position: field.primary_key_position
				};
				if( conf.data_type === 'array') {
					conf.itemType = APIDefineDataTypeToModel[field.itemType] || 'object';
				}
				modelConf.fields.push(conf);
			});
			model.paths.forEach((customApi) => {
				let apiConfig = {
					allPathId: model.id,
					requiredQueryField: customApi.requiredQueryField || [],
					availableQueryField: customApi.availableQueryField || [],
					pathTpl: customApi.path,
					method: customApi.method,
					rawName: customApi.name,
					result: customApi.result,
					type: customApi.type,
					description: customApi.description || '',
					roles: customApi['acl'] || []
				};
				if( apiConfig.type === 'preset' ){
					apiConfig.name = customApi.name;
				} else {
					if( customApi.fields && customApi.fields.length > 0){
						apiConfig.fields = [];
						customApi.fields.forEach((field) => {
							if( field.visible === true || field.visible === 'true'){
								apiConfig.fields.push(field.field_name);
							}
						});
					}

					// 预设过滤条件
					if( customApi.filter ){
						if( Object.keys(customApi.filter).length > 0 )
							apiConfig.filter = customApi.filter;
					}

					apiConfig.path = customApi.path;
				}
				modelConf.paths.push(apiConfig);
			});

			if( modelConf.fields.length === 0){
				modelConf.fields.push({
					field_name: '_id',
					data_type: 'string',
					primary_key_position: 1
				})
			}

			result.models.push(modelConf);
		}
	});

	Object.entries(dataSource).forEach(([dataSourceId, dbConf])=> {
		result.dataSource.push(dbConf);
	});

	return result;

};


/**
 * 测试
 */
const test = (function(){

	const log = function(msg, format){
		msg = msg || '';

		if( typeof msg === 'object')
			msg = format ? JSON.stringify(msg, '', '\t') : JSON.stringify(msg);
		console.log(msg);
	};

	/*log('test convertCondition');
	log(convertCondition({"column":"role","operation":1,"value":1,"datatype":"string","relation":"&&"}));
	log(convertCondition({"column":"role","operation":2,"value":1,"datatype":"string","relation":"&&"}));
	log(convertCondition({"column":"role","operation":3,"value":1,"datatype":"string","relation":"&&"}));
	log(convertCondition({"column":"role","operation":4,"value":1,"datatype":"string","relation":"&&"}));
	log(convertCondition({"column":"role","operation":5,"value":1,"datatype":"string","relation":"&&"}));
	log(convertCondition({"column":"role","operation":6,"value":1,"datatype":"string","relation":"&&"}));
	log(convertCondition({"column":"role","operation":7,"value":1,"datatype":"string","relation":"&&"}));
	log(convertCondition({"column":"role","operation":8,"value":1,"datatype":"string","relation":"&&"}));
*/
	log();
	log('test buildQuery');

	log(buildQuery({"column":"role","operation":1,"value":1,"datatype":"string","relation":"&&"}));

	log(buildQuery({
		'items': [
			{'column': 'sku', 'operation': 6, 'value': '862', 'datatype': 'string', 'relation': '&&'},
			{
				'column': 'qty',
				'operation': 6,
				'value': 61,
				'datatype': 'string',
				'relation': '||',
			}],
	}));
	log(buildQuery({
		'items': [
			{'column': 'sku', 'operation': 6, 'value': '862', 'datatype': 'string', 'relation': '&&'},
			{
				items: [{
					'column': 'qty',
					'operation': 6,
					'value': 61,
					'datatype': 'string',
					'relation': '&&',
				}, {
					'column': 'price',
					'operation': 6,
					'value': 12,
					'datatype': 'string',
					'relation': '&&',
				}],
				'relation': '||'
			}
			]
	}));

	log(buildQuery({
		items: [
			{
				items: [
					{"column":"role","operation":1,"value":1,"datatype":"string","relation":"&&"},
					{"column":"role","operation":1,"value":1,"datatype":"string","relation":"||"}
				],
				relation:"&&"
			},
			{
				items: [
					{"column":"role","operation":1,"value":1,"datatype":"string","relation":"&&"},
					{"column":"role","operation":1,"value":1,"datatype":"string","relation":"||"}
				],
				relation:"||"
			}
		]
	}));
	log(buildQuery({
		items: [
			{
				items: [
					{"column":"role","operation":1,"value":1,"datatype":"string","relation":"&&"},
					{"column":"name","operation":1,"value":1,"datatype":"string","relation":"||"}
				]
			},
			{"column":"age","operation":1,"value":2,"datatype":"string","relation":"||"}
		]
	}));
	log(buildQuery({
		items: [
			{
				items: [
					{"column":"role","operation":1,"value":1,"datatype":"string","relation":"&&"},
					{"column":"role","operation":1,"value":1,"datatype":"string","relation":"||"}
				]
			},
			{"column":"role","operation":1,"value":2,"datatype":"string","relation":"||"}
		]
	}));
});
//test();

