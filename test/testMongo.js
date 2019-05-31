let mongodb = require('mongodb');

new mongodb.MongoClient('mongodb://127.0.0.2/tapdata').connect((err, client) => {

	if( err ){
		console.error(err);
	} else {
		console.log("Connected successfully to server");
		client.close();
	}

});

