/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/21/19
 * @description
 */
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://lg:lG1208_@cluster0-lzjod.azure.mongodb.net/ld?retryWrites=true';
const client = new MongoClient(uri, {
	useNewUrlParser: true
});
client.connect(function(err){
	console.log(err.toString());
});

