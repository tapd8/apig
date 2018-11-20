let Generator = require('../generators');

let generator = new Generator();

/*console.log(generator.sourceRoot());
console.log(generator.destinationRoot());

console.log(generator.templatePath('model', 'template', 'model.ejs'));
console.log(generator.destinationPath('models'));*/

// 允许类型：
generator.model({
	name: 'test',
	properties: {
		id: {type: '\'number\'', id: true, tsType: 'number'},
		name: {type: '\'string\'', tsType: 'string', required: true},
		title: {type: '\'string\'', tsType: 'string'},
		amount: {type: '\'number\'', tsType: 'number'},
		desc: {type: '\'string\'', tsType: 'string'},
	},
});