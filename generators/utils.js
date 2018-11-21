const _ = require('lodash');
const camelCase = require('change-case').camelCase;

/**
 * Converts a name to class name after validation
 */
exports.toClassName = function(name) {
	if (name === '') return new Error('no input');
	if (typeof name !== 'string' || name == null) return new Error('bad input');
	return name.substring(0, 1).toUpperCase() + name.substring(1);
};

/**
 *  Returns the modelName in the directory file format for the model
 * @param {string} modelName
 */
exports.getModelFileName = function(modelName) {
	return `${_.kebabCase(modelName)}.model.ts`;
};

/**
 * Returns the repositoryName in the directory file format for the repository
 * @param {string} repositoryName
 */
exports.getRepositoryFileName = function(repositoryName) {
	return `${_.kebabCase(repositoryName)}.repository.ts`;
};

/**
 * Returns the dataSourceName in the directory file format for the dataSource
 * @param {string} dataSourceName
 */
exports.getDataSourceFileName = function(dataSourceName) {
	return `${_.kebabCase(dataSourceName)}.datasource.ts`;
};

/**
 * Returns the controllerName in the directory file format for the controller
 * @param {string} controllerName
 */
exports.getControllerFileName = function(controllerName) {
	return `${_.kebabCase(controllerName)}.datasource.ts`;
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