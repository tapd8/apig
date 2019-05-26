let {ModelGenerator, DataSourceGenerator, RepositoryGenerator, ControllerGenerator} = require('../generators');



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
}).on('done', ()=>{
	console.log('生成完成');
});

new RepositoryGenerator({
	name: 'order',
	dataSourceName: 'mongodb',
	idProperty: 'id'
}).on('done', ()=>{
	console.log('生成完成');
});

/*new ModelGenerator({
	name: 'test',
	properties: {
		id: {type: 'number', id: true, },
		name: {type: 'string', required: true},
		title: {type: 'array', itemType: 'string'},
		amount: {type: 'number'},
		desc: {type: 'buffer'},
	},
}).on('done', ()=>{
	console.log('生成完成');
});*/

new ModelGenerator({
	name: 'order',
	properties: {
		id: {type: 'number', id: true, },
		name: {type: 'string', required: true},
		title: {type: 'array', itemType: 'string', required: true},
		amount: {type: 'number'},
		desc: {type: 'buffer'},
	},
}).on('done', ()=>{
	console.log('生成完成');
});

new ControllerGenerator({
	name: 'order',
	httpPathName: 'orders',
	idType: 'number'
}).on('done', ()=>{
	console.log('生成完成');
});

