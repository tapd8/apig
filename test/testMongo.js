let mongodb = require('mongodb');

new mongodb.MongoClient('mongodb://johndoe:my_password@beidou.mongoing.com:27040/my_db?authSource=admin', {password: 'my_password', user: 'johndoe', w: 1}).connect((err, client) => {

	console.log(err);

	console.log("Connected successfully to server");

	const db = client.db('my_db');

	db.collection('arrayd').findOne({}, function(err, data) {
		console.log(data)
	});

	client.close();

});
