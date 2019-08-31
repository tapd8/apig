/**
 * @author lg<lirufei0808@gmail.com>
 * @date 8/31/19
 * @description
 */

const parseSchema = require('mongodb-schema');
const {MongoDataTypeToJava} = require('./generators/data-type-mapping');

/**
 *
 * @param name
 * @param originalName
 * @param collectionName
 * @param type
 * @param itemType
 * @returns {{field_name: *, table_name: *, data_type: *, javaType: *, itemType: *, primary_key_position: number, foreign_key_table: null, foreign_key_column: null, key: string, precision: null, scale: null}}
 */
const definitionField = function(name, originalName, collectionName, type, itemType){
	let dif = {
		"field_name": name,
		"table_name": collectionName,
		"data_type": type,
		"javaType": MongoDataTypeToJava[type] || 'String',
		"itemType": MongoDataTypeToJava[itemType] || itemType,
		"primary_key_position": name === '_id' ? 1 : 0,
		"foreign_key_table": null,
		"foreign_key_column": null,
		"key": name === '_id' ? "PRI" : null,
		"precision": null,
		"scale": null
	};
	if( originalName ){
		dif['original_field_name'] = originalName;
		dif['parent'] = name.substring(0, name.lastIndexOf('.'));
	}
	return dif;
};

const processData = function(docs){
	if( !docs)
		return;
	if( Array.isArray(docs)) {
		for( let i = 0; i < docs.length; i++) {
			if( Array.isArray(docs[i])) {
				docs.splice(i, 1);
				i--;
			} else if( typeof docs[i] === 'object') {
				processData(docs[i]);
			}
		}
	} else if( typeof docs === 'object') {
		Object.keys(docs).forEach(key => {
			processData(docs[key]);
		});
	}
};

const schemaConvert = function(collectionName, fields, result) {
	if( fields && Array.isArray(fields)){
		fields.forEach( field=> {
			let type = 'String';
			if (typeof field.type === 'string')
				type = field.type;
			else if (Object.prototype.toString.call(field.type) === '[object Array]') {
				let arr = field.type.filter(v => v !== 'Undefined' && v !== 'Null');
				type = arr[0] || 'String';
			}
			let itemType = null;
			if( type === 'Array') {
				field.types.forEach(v => {
					if( v.name === 'Array' && v.types ) {
						v.types.forEach(t => {
							if( !itemType && t.name !== "Null") {
								itemType = t.name;
							}
						});
					}
				});
			}
			result.push(definitionField(field.path, field.name, collectionName, type, itemType));

			if( type === 'Array' ) {
				if( field.types && field.types.length > 0){
					let types = field.types.filter(v => v.name === 'Array');
					if(types && types.length > 0) {
						types.forEach( t => {
							if( t.types ) {
								t.types.forEach( v => {
									if( v.name === 'Document') {
										schemaConvert(collectionName, v.fields, result);
									}
								});
							}
						});
					}
				}
			} else if( type === 'Document') {
				if( field.types && field.types.length > 0){
					let docs = field.types.filter(v => v.name === 'Document');
					if( docs && docs.length > 0) {
						docs.forEach( d => {
							schemaConvert(collectionName, d.fields, result);
						});
					}
				}
			}
		});
	}
};

/**
 * load mongodb collection schema
 * @param collection mongodb collection
 * @param cb
 */
const getCollectionSchema = function (collection, cb) {
	let collectionName = collection.collectionName;
	try {
		collection.aggregate( [ { $sample: { size: 100 } } ], {}, function(err, result) {

			result.toArray( function(err, docs) {

				processData(docs);

				parseSchema(docs, function (err, schema) {
					if (err) {
						log.error('get collection ' + collectionName + ' schema fail\n', err);
						cb(err, null);
					} else {

						const result = {
							table_name: collectionName,
							fields: []
						};

						if (schema && schema.fields.length > 0) {
							schemaConvert(collectionName, schema.fields, result.fields);
							/*schema.fields.forEach(field => {
								let type = 'String';
								if (typeof field.type === 'string')
									type = field.type;
								else if (Object.prototype.toString.call(field.type) === '[object Array]') {
									let arr = field.type.filter(v => v !== 'Undefined' && v !== 'Null');
									type = arr[0] || 'String';
								}
								let itemType = null;
								if( type === 'Array') {
									field.types.forEach(v => {
										if( v.name === 'Array' && v.types ) {
											v.types.forEach(t => {
												if( !itemType && t.name !== "Null") {
													itemType = t.name;
												}
											});
										}
									});
								}
								result.fields.push(definitionField(field.name, collectionName, type, itemType));
							});*/
						}
						// add _id field by default when there is no field.
						if (result.fields.length === 0) {
							result.fields.push(definitionField('_id', collectionName, 'String'))
						}
						cb(null, result);
					}
				});
			});

		} );

	} catch (e) {
		log.error(`get collection ${collectionName} schema fail`, e)
	}
};

exports.getCollectionSchema = getCollectionSchema;
