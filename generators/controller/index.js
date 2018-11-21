
const Generator = require('../generator');
const utils = require('../utils');
const CONTROLLER_REST_TEMPLATE_PATH = 'templates/controller-rest-template.ts.ejs';

class ControllerGenerator extends Generator {

	constructor(config) {
		super(config);

		this.artifactInfo = Object.assign({
			type: 'controller',
			rootDir: this.destinationRoot(),
			outDir: utils.controllersDir
		}, config);

		this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
		this.artifactInfo.modelName = utils.toClassName(this.artifactInfo.name);
		this.artifactInfo.repositoryName = utils.toClassName(this.artifactInfo.name);
		this.artifactInfo.modelVariableName = utils.camelCase(this.artifactInfo.modelName);
		this.artifactInfo.repositoryNameCamel = utils.camelCase(this.artifactInfo.repositoryName);
		this.artifactInfo.httpPathName = this.artifactInfo.name;
		this.artifactInfo.idType = 'number';

		this.artifactInfo.outFile = utils.getControllerFileName(this.artifactInfo.name);

	}


}