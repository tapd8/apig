const _ = require('lodash');
const camelCase = require('change-case').camelCase;

/**
 * Converts a name to class name after validation
 */
exports.toClassName = function(name) {
	if (name === '') return new Error('no input');
	if (typeof name !== 'string' || name == null) return new Error('bad input');

	name = name.replace(/[-,\/,\\,\$,\%,\s,:]/g, '_')

	if( /^\d/.test(name))
		name = `L_${name}`

	return name.substring(0, 1).toUpperCase() + name.substring(1);
};

/**
 *  Returns the modelName in the directory file format for the model
 * @param {string} modelName
 */
const modelSuffix = exports.modelSuffix = '.model.ts';
exports.getModelFileName = function(modelName) {
	return `${_.kebabCase(modelName)}${modelSuffix}`;
};

/**
 * Returns the repositoryName in the directory file format for the repository
 * @param {string} repositoryName
 */
const repositorySuffix = exports.repositorySuffix = '.repository.ts';
exports.getRepositoryFileName = function(repositoryName) {
	return `${_.kebabCase(repositoryName)}${repositorySuffix}`;
};

/**
 * Returns the dataSourceName in the directory file format for the dataSource
 * @param {string} dataSourceName
 */
const dataSourceSuffix  = exports.dataSourceSuffix = '.datasource.ts';
exports.getDataSourceFileName = function(dataSourceName) {
	return `${_.kebabCase(dataSourceName)}${dataSourceSuffix }`;
};

/**
 * Returns the controllerName in the directory file format for the controller
 * @param {string} controllerName
 */
const controllerSuffix   = exports.controllerSuffix = '.controller.ts';
exports.getControllerFileName = function(controllerName) {
	return `${_.kebabCase(controllerName)}${controllerSuffix}`;
};

exports.kebabCase = _.kebabCase;
exports.camelCase = camelCase;

exports.controllersDir = 'controllers';
exports.repositoriesDir = 'repositories';
exports.datasourcesDir = 'datasources';
exports.servicesDir = 'services';
exports.modelsDir = 'models';
exports.sourceRootDir = 'generators';
exports.destinationRootDir = 'src';
