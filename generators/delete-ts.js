const utils = require('./utils');
const path = require('path');
const fs = require('fs');
const log = require('../dist').log.generator;

/**
 * 删除旧文件
 */
const includeDirector = [utils.controllersDir, utils.datasourcesDir, utils.repositoriesDir, utils.modelsDir, utils.servicesDir];
const includeFileSuffix = [utils.modelSuffix, utils.dataSourceSuffix, utils.repositorySuffix, utils.controllerSuffix, '.datasource.json'];
module.exports = function(cb){
	const scanFS = require('scan-fs').create();

	let dir = `${__dirname}/../${utils.destinationRootDir}`;

	scanFS.listeners({
		'file': function(filePath, eOpts){

			const fileName = path.basename(filePath);

			if( !includeDirector.includes(path.basename(path.dirname(filePath))) )
				return;

			let suffix = fileName.slice(fileName.indexOf('.'));
			if( !includeFileSuffix.includes(suffix) && fileName !== 'index.ts' )
				return;

			log.info(`delete file ${filePath}`);
			fs.unlinkSync(filePath);
		},
		'complete': function(){
			if( typeof cb === 'function' ) cb(true);
		}
	}).setRecursive(true)
		.scan(dir)
};
