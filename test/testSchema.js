/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/30/19
 * @description
 */
const mongodb = require('mongodb');
const parseSchema = require('mongodb-schema');

new mongodb.MongoClient('mongodb://127.0.0.1/moa').connect((err, client) => {

	console.log("Connected successfully to server");

	const db = client.db();

	let cursor = db.collection('order').find().sort('_id', -1).limit(10);

	parseSchema(cursor, function(err, schema){
		console.log(JSON.stringify(schema, '', '\t'));

		client.close();
	});

});

