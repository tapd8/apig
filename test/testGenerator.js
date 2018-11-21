let {ModelGenerator, DataSourceGenerator, RepositoryGenerator} = require('../generators');


new DataSourceGenerator({
	name: 'mongodb',
	settings: {
		"url": "mongodb://localhost:27017/test",
		"host": "localhost",
		"port": 27017,
		"user": "",
		"password": "",
		"database": "test"
	}
});

new RepositoryGenerator({
	name: 'order',
	dataSourceName: 'mongodb',
	idProperty: 'id'
});

new ModelGenerator({
	name: 'test',
	properties: {
		id: {type: 'number', id: true, },
		name: {type: 'string', required: true},
		title: {type: 'array', itemType: 'string'},
		amount: {type: 'number'},
		desc: {type: 'buffer'},
	},
});

new ModelGenerator({
	name: 'order',
	properties: {
		id: {type: 'number', id: true, },
		name: {type: 'string', required: true},
		title: {type: 'array', itemType: 'string', required: true},
		amount: {type: 'number'},
		desc: {type: 'buffer'},
	},
});