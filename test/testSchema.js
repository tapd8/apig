/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/30/19
 * @description
 */
const mongodb = require('mongodb');
const { getCollectionSchema } = require('../load_schema_mongo');

new mongodb.MongoClient('mongodb://127.0.0.1/tapdata_target', {
	useNewUrlParser: true
}).connect((err, client) => {

	console.log("Connected successfully to server");

	const db = client.db();

	db.collections(function(err, collections){

		let pending = 0;
		const schema = {
				tables: []
			},
			errors = [],
			finish = function () {
				pending--;
				if (pending === 0) {
					console.log(JSON.stringify(schema, '', '\t'));
					client.close();
				}
			};
		collections.forEach((collection) => {
			pending++;
			console.log(`get collection ${collection.s.dbName + collection.s.name} schema`);
			getCollectionSchema(collection, function (err, collectionSchema) {
				if (err) {
					log.error('get collection schema fail\n', err);
					errors.push(err);
				} else {
					schema.tables.push(collectionSchema);
				}
				finish();
			});

		});

	});

});

