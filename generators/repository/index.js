const Generator = require('../generator');
const utils = require('../utils');
const REPOSITORIES_CRUD_TEMPLATE_PATH = 'templates/repository-crud-default-template.ts.ejs';

/**
 * 存储服务生成器
 */
class RepositoryGenerator extends Generator {

	constructor(repositoriesConfig) {
		super(repositoriesConfig);

		this.artifactInfo = Object.assign({
			type: 'repository ',

			repositoryTypeClass: 'DefaultCrudRepository',

			rootDir: this.destinationRoot(),
			outDir: utils.repositoriesDir,
			datasourcesDir: utils.datasourcesDir,
			modelDir: utils.modelsDir
		}, repositoriesConfig);

		this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
		this.artifactInfo.modelName = utils.toClassName(this.artifactInfo.name);

		this.artifactInfo.dataSourceClassName =
			utils.toClassName(this.artifactInfo.dataSourceName) + 'DataSource';

		this.artifactInfo.outFile = utils.getRepositoryFileName(this.artifactInfo.name);

		const tsPath = this.destinationPath(
			this.artifactInfo.outDir,
			this.artifactInfo.outFile
		);

		const templatePath = this.templatePath(
			'repository', REPOSITORIES_CRUD_TEMPLATE_PATH
		);

		this.copyTemplateTpl(templatePath, tsPath, this.artifactInfo);
		this.log.info(`generator repository ${tsPath}`);
	}

}
module.exports = RepositoryGenerator ;

