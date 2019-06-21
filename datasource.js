/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/17/19
 * @description
 */
const log = require('./dist').log.app;
const request = require('request');
const path = require('path');
const appConfig = require('./config');
const getToken = require('./tapdata').getToken;
const MongoClient = require('mongodb').MongoClient;
const parse = require('mongodb-core').parseConnectionString;
const parseSchema = require('mongodb-schema');


const getConnection = function(token){
	let url = appConfig.tapDataServer.connectionUrl + '?access_token=' + token;
	try{
		let params = {
			'filter[where][status]': 'testing'
		};
		request.get(url, {qs: params, json: true}, function (err, response, body) {
			if (err) {
				log.error('get connection fail.', err);
			} else if(response.statusCode === 200){

				if(body && body.length > 0){
					body.forEach(v => {
						testConnection(v);
					})
				}

			} else {
				log.error('get connection error: \n', body);
			}
		});

	} catch(e) {
		log.error('get connection to test fail:\n', e);
	}
},

testConnection = function(connection){

	try {
		if( connection){

			//const uri = "mongodb+srv://<username>:<password>@<your-cluster-url>/test?retryWrites=true";
			const uri = connection.database_uri;
			const validate_details = [];
			parse(uri, (err, uriObj) => {

				validate_details.push({
					"stage_code" : "validate-3000",
					"show_msg" : "Checking the connection uri is available.",
					"status" : err ? "invalid" : "passed",
					"sort" : 1,
					"error_code" : null,
					"fail_message" : err ? err.toString() : null,
					"required" : true
				});

				if(err){
					log.error('connect to mongodb error\n', err);
					updateConnection(connection.id, {
						status: 'invalid',
						response_body: {
							validate_details: validate_details
						}
					}, function(err, data){});
				}

				validate_details.push({
					"stage_code" : "validate-3100",
					"show_msg" : "Checking the connection database name is available.",
					"status" : uriObj['defaultDatabase'] ? "passed" : "invalid",
					"sort" : 1,
					"error_code" : null,
					"fail_message" : uriObj['defaultDatabase'] ? null : "No database name",
					"required" : true
				});

				if( !uriObj['defaultDatabase'] ){
					updateConnection(connection.id, {
						status: 'invalid',
						response_body: {
							validate_details: validate_details
						}
					}, function(err, data){});
				} else {
					const client = new MongoClient(uri, {
						useNewUrlParser: true
					});
					client.connect(err => {

						validate_details.push({
							"stage_code" : "validate-3100",
							"show_msg" : "Checking the connection is available.",
							"status" : err ? "invalid" : "passed",
							"sort" : 1,
							"error_code" : null,
							"fail_message" : err ? err.toString() : null,
							"required" : true
						});

						if(err){
							log.error('connect to mongodb error\n', err);
							updateConnection(connection.id, {
								status: 'invalid',
								response_body: {
									validate_details: validate_details
								}
							}, function(err, data){
								client.close();
							});
						} else {
							const databaseName = uriObj['defaultDatabase'] || 'test';
							const db = client.db(databaseName);
							log.info('connected mongodb, database name is ' + db.databaseName);

							db.collections(function(err, collections){

								let pending = 0;
								const schema = {
										tables: []
									},
									errors = [],
									finish = function(){
										pending--;
										if(pending === 0) {

											validate_details.push({
												"stage_code" : "validate-3200",
												"show_msg" : "Trying to load schema.",
												"status" : errors.length === 0 ? "passed" : "invalid",
												"sort" : 2,
												"error_code" : null,
												"fail_message" : errors.length > 0 ? errors.join("\n") : null,
												"required" : true
											});

											updateConnection(connection.id, {
												status: 'ready',
												schema: schema,
												response_body: {
													validate_details: validate_details
												}
											}, function(err, result){
												if(err){
													log.error('test mongodb connection fail\n', err);
												} else {
													log.info('test mongodb connection done.');
												}
												client.close();
											});
										}
									};
								collections.forEach((collection) => {
									pending++;
									getCollectionSchema(collection, function(err, collectionSchema){
										if( err){
											log.error('get collection schema fail\n', err);
											errors.push(err);
										} else {
											schema.tables.push(collectionSchema);
										}
										finish();
									});

								});

							});
						}
					});
				}
			});
		}
	} catch (e) {
		log.error('test connection fail\n', e);
	}

},

getCollectionSchema = function(collection, cb){
	let collectionName = collection.collectionName;
	try{
		let cursor = collection.find().sort('_id', -1).limit(10);

		parseSchema(cursor, function(err, schema){
			if(err){
				log.error('get collection ' + collectionName + ' schema fail\n', err);
				cb(err, null);
			} else {

				const result = {
					table_name: collectionName,
					fields: []
				};

				if( schema && schema.fields.length > 0){
					schema.fields.forEach(field => {
						let type = 'String';
						if(typeof field.type === 'string')
							type = field.type;
						else if( Object.prototype.toString.call(field.type) === '[object Array]'){
							let arr = field.type.filter(v => v !== 'Undefined' && v !== 'Null');
							type = arr[0] || 'String';
						}
						if( type === 'ObjectID')
							type = 'ObjectId';
						result.fields.push({
							"field_name" : field.name,
							"table_name" : collectionName,
							"data_type" : type,
							"primary_key_position" : field.name === '_id' ? 1 : 0,
							"foreign_key_table" : null,
							"foreign_key_column" : null,
							"key" : "PRI",
							"precision" : null,
							"scale" : null
						});
					});
				}
				if( result.fields.length === 0){
					result.fields.push({
						"field_name" : "_id",
						"table_name" : collectionName,
						"data_type" : 'ObjectId',
						"primary_key_position" : 1,
						"foreign_key_table" : null,
						"foreign_key_column" : null,
						"key" : "PRI",
						"precision" : null,
						"scale" : null
					})
				}
				cb(null, result);
			}
		});

	} catch (e) {
		log.error(`get collection ${collectionName} schema fail`, e)
	}
},

updateConnection = function(id, data, cb) {

	log.info('update connection: ' + id);
	getToken(function(token){

		let url = appConfig.tapDataServer.connectionUrl + `/${id}?access_token=` + token;
		try{
			request({
				url: url,
				method: 'PATCH',
				json: true,
				body: data
			}, function (err, response, body) {
				if (err) {
					log.error('update connection fail.', err);
					cb(err, null);
				} else if(response.statusCode === 200){

					log.info('update connection success ' + id);
					cb(null, body);

				} else {
					log.error('update connection error: \n', body);
					cb(body, null);
				}
			});

		} catch(e) {
			log.error('update connection to test fail:\n', e);
			cb(e, null);
		}

	});

};

if( appConfig.model === 'cloud'){
	setInterval(() => {
		try{
			getToken(token => {
				if( token )
					getConnection(token);
			})
		} catch (e) {
			log.error('get connection to test fail:\n', e);
		}

	}, 2000);
}
