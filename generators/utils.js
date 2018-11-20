const _ = require('lodash');

/**
 *  Returns the modelName in the directory file format for the model
 * @param {string} modelName
 */
exports.getModelFileName = function(modelName) {
	return `${_.kebabCase(modelName)}.model.ts`;
};

/**
 * Converts a name to class name after validation
 */
exports.toClassName = function(name) {
	if (name === '') return new Error('no input');
	if (typeof name !== 'string' || name == null) return new Error('bad input');
	return name.substring(0, 1).toUpperCase() + name.substring(1);
};

/**
 * Returns the repositoryName in the directory file format for the repository
 * @param {string} repositoryName
 */
exports.getRepositoryFileName = function(repositoryName) {
	return `${_.kebabCase(repositoryName)}.repository.ts`;
};

/**
 * Returns the serviceName in the directory file format for the service
 * @param {string} serviceName
 */
exports.getServiceFileName = function(serviceName) {
	return `${_.kebabCase(serviceName)}.service.ts`;
};

exports.controllersDir = 'controllers';
exports.repositoriesDir = 'repositories';
exports.datasourcesDir = 'datasources';
exports.servicesDir = 'services';
exports.modelsDir = 'models';
exports.sourceRootDir = 'src';