const gulp = require('gulp');
const { taskArgs } = require('./_util');
const through2 = require('through2');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const addErrors = require('ajv-errors');

const defaultGlobs = ['data/registry/*.yml'];

let numFilesProcessed = 0,
  numFilesWithIssues = 0;
let debugFlag = false;

const schema = require('../data/registry-schema.json');
delete schema['cspell:ignore'];
const ajv = new Ajv({
  allErrors: true,
});
addFormats(ajv);
addErrors(ajv);
const validate = ajv.compile(schema);

function logFiles(debug) {
  return through2.obj(function (file, enc, cb) {
    if (debug) {
      console.log('Processing file:', file.path);
    }
    cb(null, file);
  });
}

function createSourceMap(yamlText, yamlData) {
  const lines = yamlText.split('\n');
  const sourceMap = {};

  function traverse(node, path = '', startLine = 0) {
    if (Array.isArray(node)) {
      node.forEach((item, index) => {
        const newPath = `${path}/${index}`;
        const line = findArrayElementLine(lines, path, index, startLine);
        if (line !== -1) {
          sourceMap['/' + newPath] = line + 1; // line numbers are 1-based
          traverse(item, newPath, line);
        }
      });
    } else if (typeof node === 'object' && node !== null) {
      for (const key in node) {
        const newPath = path ? `${path}/${key}` : key;
        const line = findKeyLine(lines, key, startLine);
        if (line !== -1) {
          sourceMap['/' + newPath] = line + 1; // line numbers are 1-based
          traverse(node[key], newPath, line + 1);
        }
      }
    } else if (node === null) {
      sourceMap['/' + path] = startLine;
    }
  }

  function findKeyLine(lines, key, startLine) {
    const regex = new RegExp(`^\\s*-?\\s*${key}:`);
    for (let i = startLine; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        return i;
      }
    }
    return -1;
  }

  function findArrayElementLine(lines, path, index, startLine) {
    // const parentPath = path ? path.split('.').join('\\.') : '';
    const regex = new RegExp(`^\\s*-`);
    let currentIndex = -1;
    for (let i = startLine; i < lines.length; i++) {
      const trimmedLine = lines[i].trim();
      if (regex.test(trimmedLine)) {
        currentIndex++;
        if (currentIndex === index) {
          return i;
        }
      }
    }
    return -1;
  }
  traverse(yamlData);
  return sourceMap;
}

function getLineNumber(sourceMap, yamlPath) {
  return sourceMap[yamlPath] || null;
}

function validateRegistryEntry(file, enc, cb) {
  const registryEntry = yaml.load(file.contents.toString(), {
    schema: yaml.JSON_SCHEMA,
  });

  const sourceMap = createSourceMap(file.contents.toString(), registryEntry);

  const valid = validate(registryEntry);
  if (!valid) {
    // some validation issues let to warning/notices not errors, so we need to check for those
    let hasErrors = false;
    for (const error of validate.errors) {
      const lineNumber = getLineNumber(sourceMap, error.instancePath);

      if (!lineNumber) {
        console.log(registryEntry);
        console.log(yaml.load(file.contents.toString()));
        console.log(sourceMap);
        console.log(error.instancePath);
      }

      let logLevel = 'error';

      hasErrors = true;

      if (process.env.GITHUB_ACTIONS) {
        console.log(
          `::${logLevel} file=${file.path},line=${lineNumber},endLine=${lineNumber},title=Registry Schema Validation::${error.message}`,
        );
      } else if (debugFlag) {
        console.log(error);
        console.error(
          `${logLevel} in ${file.path}:${lineNumber}: ${error.message}`,
        );
      }
    }
    if (hasErrors) {
      numFilesWithIssues++;
    }
  }
  numFilesProcessed++;
  cb(null, file);
}

function validateRegistry() {
  const argv = taskArgs().options({
    glob: {
      alias: 'g',
      type: 'array',
      description:
        'Globs of files to run through json schema validation. List flag more than once for multiple values.',
      default: defaultGlobs,
    },
    debug: {
      type: 'boolean',
      description: 'Output debugging information.',
      default: false,
    },
  }).argv;

  if (argv.info) {
    // Info about options was already displayed by yargs.help().
    return Promise.resolve();
  }

  const globs = argv.glob;
  if (argv.debug) {
    console.log('Globs being used:', globs);
  }
  debugFlag = argv.debug;

  return gulp
    .src(globs, { followSymlinks: false })
    .pipe(logFiles(argv.debug))
    .pipe(through2.obj(validateRegistryEntry))
    .on('end', () => {
      const fileOrFiles = 'file' + (numFilesProcessed == 1 ? '' : 's');
      const msg = `Processed ${numFilesProcessed} ${fileOrFiles}, ${numFilesWithIssues} had issues.`;
      if (numFilesWithIssues > 0) {
        throw new Error(msg);
      } else {
        console.log(msg);
      }
    });
}

gulp.task('validate-registry', validateRegistry);
