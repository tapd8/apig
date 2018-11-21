
const Generator = require('../generator');
const utils = require('../utils');
const DATA_SOURCE_TEMPLATE_PATH = 'templates/datasource.ts.ejs';

class DataSourceGenerator extends Generator {
	constructor(dataSourceConfig) {
		super(dataSourceConfig);

		this.artifactInfo = Object.assign({
			type: 'datasource',
			rootDir: this.destinationRoot(),
			outDir: utils.datasourcesDir,
		}, dataSourceConfig);

		this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
		this.artifactInfo.fileName = utils.kebabCase(this.artifactInfo.name);
		this.artifactInfo.jsonFileName = `${this.artifactInfo.fileName}.datasource.json`;
		this.artifactInfo.outFile = utils.getDataSourceFileName(this.artifactInfo.name);

		// Resolved Output Paths.
		const jsonPath = this.destinationPath(
			this.artifactInfo.outDir,
			this.artifactInfo.jsonFileName,
		);
		const tsPath = this.destinationPath(
			this.artifactInfo.outDir,
			this.artifactInfo.outFile,
		);

		// template path
		const classTemplatePath = this.templatePath('datasource', DATA_SOURCE_TEMPLATE_PATH);

		const ds = Object.assign({
			"name": this.artifactInfo.name,
			"connector": "mongodb",
		}, this.artifactInfo.settings);

		// Copy Templates
		this.fs.writeJSON(jsonPath, ds);
		this.copyTemplateTpl(classTemplatePath, tsPath, this.artifactInfo);
		this.log.info(`generator data source config ${jsonPath}`);
		this.log.info(`generator data source ${tsPath}`);
	}

}

module.exports = DataSourceGenerator;