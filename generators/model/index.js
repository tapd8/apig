
const Generator = require('../generator');
const utils = require('../utils');
const MODEL_TEMPLATE_PATH = 'templates/model.ts.ejs';
const BASE_MODELS = [
	'Entity',
	'Model',
	{type: 'separator', line: '----- Custom Models -----'},
];

/**
 * 模型生成器
 */
class ModelGenerator extends Generator {

	constructor(modelConfig) {
		super(modelConfig);

		this.artifactInfo = Object.assign({
			type: 'model',
			rootDir: this.destinationRoot(),
			outDir: utils.modelsDir,
			isModelBaseBuiltin: true,
			modelBaseClass: 'Entity',
			className: '',
		}, modelConfig);

		this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
		// Data for templates
		this.artifactInfo.outFile = utils.getModelFileName(this.artifactInfo.name);

		this.artifactInfo.isModelBaseBuiltin = BASE_MODELS.includes(
			this.artifactInfo.modelBaseClass,
		);

		// Set up types for Templating
		const TS_TYPES = ['string', 'number', 'object', 'boolean', 'any'];
		const NON_TS_TYPES = ['geopoint', 'date'];
		Object.values(this.artifactInfo.properties).forEach(val => {
			// Default tsType is the type property
			val.tsType = val.type;

			// Override tsType based on certain type values
			if (val.type === 'array') {
				if (TS_TYPES.includes(val.itemType)) {
					val.tsType = `${val.itemType}[]`;
				} else if (val.type === 'buffer') {
					val.tsType = 'Buffer[]';
				} else {
					val.tsType = 'string[]';
				}
			} else if (val.type === 'buffer') {
				val.tsType = 'Buffer';
			}

			if (NON_TS_TYPES.includes(val.tsType)) {
				val.tsType = 'string';
			}

			if (
				val.defaultValue &&
				NON_TS_TYPES.concat(['string', 'any']).includes(val.type)
			) {
				val.defaultValue = `'${val.defaultValue}'`;
			}

			// Convert Type to include '' for template
			val.type = `'${val.type}'`;
			if (val.itemType) {
				val.itemType = `'${val.itemType}'`;
			}

			// If required is false, we can delete it as that's the default assumption
			// for this field if not present. This helps to avoid polluting the
			// decorator with redundant properties.
			if (!val.required) {
				delete val.required;
			}

			// We only care about marking the `id` field as `id` and not fields that
			// are not the id so if this is false we delete it similar to `required`.
			if (!val.id) {
				delete val.id;
			}
		});

		// Resolved Output Path
		const tsPath = this.destinationPath(
			this.artifactInfo.outDir,
			this.artifactInfo.outFile,
		);

		let template = this.templatePath('model', MODEL_TEMPLATE_PATH);

		this.copyTemplateTpl(template, tsPath, this.artifactInfo);
		this.log.info(`generator model ${tsPath}`);
	}

}
module.exports = ModelGenerator;