const memFs = require("mem-fs");
const editor = require("mem-fs-editor");
const fs = require('fs');
const path = require('path');
const makeDir = require('make-dir');
const through = require('through2');
const log = require('../dist').log.generator;
const updateIndex = require('./update-index');
const utils = require('./utils');
const EventEmitter = require('events').EventEmitter;

/**
 * source code generator base class.
 */
class Generator extends EventEmitter{

	constructor(props){
		super(props);

		this.artifactInfo = {};
		this.log = log;
		const store = memFs.create();
		this.fs = editor.create(store);

		this.sourceRoot(`${__dirname}/../${utils.sourceRootDir}`);
		this.destinationRoot(`${__dirname}/../${utils.destinationRootDir}`);

		store.on('change', this._writeFiles.bind(this));
	}

	/**
	 * Write memory fs file to disk and logging results
	 * @param {Function} done - callback once files are written
	 * @private
	 */
	_writeFiles(done){
		done = done || function(){};

		const transformStreams = [];/*[through.obj(function(file, enc, cb){
			const stream = this;

			const filename = path.basename(file.path);
			console.log(filename);

			stream.push(file);
			cb();
		})];*/
		this._temp = null;
		this.fs.commit(transformStreams, () => {
			if( this._temp ){
				clearTimeout(this._temp);
				this._temp = null;
			}
			this._temp = setTimeout(()=>{
				this._updateIndexFiles();
				done();
			}, 1000);
		});
	}

	/**
	 * Wrapper for mem-fs-editor.copyTpl() to ensure consistent options
	 *
	 * See https://github.com/SBoudrias/mem-fs-editor/blob/master/lib/actions/copy-tpl.js
	 *
	 * @param {string} from
	 * @param {string} to
	 * @param {object} context
	 * @param {object} templateOptions
	 * @param {object} copyOptions
	 */
	copyTemplateTpl(from, to, context, templateOptions = {}, copyOptions = {
		// See https://github.com/mrmlnc/fast-glob#options-1
		globOptions: {
			// Allow patterns to match filenames starting with a period (files &
			// directories), even if the pattern does not explicitly have a period
			// in that spot.
			dot: true,
			// Disable expansion of brace patterns ({a,b}, {1..3}).
			nobrace: true,
			// Disable extglob support (patterns like +(a|b)), so that extglobs
			// are regarded as literal characters. This flag allows us to support
			// Windows paths such as
			// `D:\Users\BKU\oliverkarst\AppData(Roaming)\npm\node_modules\@loopback\cli`
			noext: true,
		},
	}){

		this.fs.copyTpl(from, to, context, templateOptions, copyOptions);
	}

	/**
	 * Change the generator source root directory.
	 * This path is used by multiples file system methods like (`this.read` and `this.copy`)
	 * @param  {String} rootPath new source root path
	 * @return {String}          source root path
	 */
	sourceRoot(rootPath) {
		if (typeof rootPath === 'string') {
			this._sourceRoot = path.resolve(rootPath);
		}
		return this._sourceRoot;
	}

	/**
	 * Change the generator destination root directory.
	 * This path is used to find storage, when using a file system helper method (like
	 * `this.write` and `this.copy`)
	 * @param  {String} rootPath new destination root path
	 * @return {String}          destination root path
	 */
	destinationRoot(rootPath) {
		if (typeof rootPath === 'string') {
			this._destinationRoot = path.resolve(rootPath);

			if (!fs.existsSync(rootPath)) {
				makeDir.sync(rootPath);
			}

			process.chdir(rootPath);
		}

		return this._destinationRoot;
	}

	/**
	 * Join a path to the source root.
	 * @param  {...String} path
	 * @return {String}    joined path
	 */
	templatePath() {
		let filepath = path.join.apply(path, arguments);

		if (!path.isAbsolute(filepath)) {
			filepath = path.join(this.sourceRoot(), filepath);
		}

		return filepath;
	}

	/**
	 * Join a path to the destination root.
	 * @param  {...String} path
	 * @return {String}    joined path
	 */
	destinationPath() {
		let filepath = path.join.apply(path, arguments);

		if (!path.isAbsolute(filepath)) {
			filepath = path.join(this.destinationRoot(), filepath);
		}

		return filepath;
	}

	/**
	 * Update the index.ts in artifactInfo.outDir. Creates it if it
	 * doesn't exist.
	 * artifactInfo.outFile is what is exported from the file.
	 *
	 * Both those properties must be present for this to happen. Optionally,
	 * this can be disabled even if the properties are present by setting:
	 * artifactInfo.disableIndexUpdate = true;
	 *
	 * Multiple indexes / files can be updated by providing an array of
	 * index update objects as follows:
	 * artifactInfo.indexesToBeUpdated = [{
	 *   dir: 'directory in which to update index.ts',
	 *   file: 'file to add to index.ts',
	 * }, {dir: '...', file: '...'}]
	 */
	async _updateIndexFiles() {
		// Index Update Disabled
		if (this.artifactInfo.disableIndexUpdate) return;

		if (!this.artifactInfo.indexesToBeUpdated) {
			this.artifactInfo.indexesToBeUpdated = [];
		}

		// No Array given for Index Update, Create default array
		if (
			this.artifactInfo.outDir &&
			this.artifactInfo.outFile &&
			this.artifactInfo.indexesToBeUpdated.length === 0
		) {
			this.artifactInfo.indexesToBeUpdated = [ {
				dir: this.destinationPath(this.artifactInfo.outDir),
				file: this.artifactInfo.outFile
			}];
		}

		for (const idx of this.artifactInfo.indexesToBeUpdated) {
			await updateIndex(idx.dir, idx.file);
			// Output for users
			const outPath = this.destinationPath(this.artifactInfo.outDir, 'index.ts');
			this.log.info('update', `${outPath}`);
		}
		this.emit('done');
	}
}

module.exports = Generator;