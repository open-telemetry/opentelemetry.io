const gulp = require('gulp');
const { taskArgs } = require('./_util');
const through2 = require('through2');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');

let cache = {};

let debugFlag = false;

let numFilesWithIssues = 0;
let filesWithIssues = [];

const defaultGlobs = [
  '**/*.jpg',
  '**/*.png',
  '**/*.svg',
  // '**/*.gif',
  '**/*.webp',
  '!**/node_modules/**',
  '!themes/**',
  '!content-modules/**',
  '!tmp/**',
  '!public/**',
  '!resources/**',
];

let check = false;

function logFiles(debug) {
  return through2.obj(function (file, enc, cb) {
    if (debug) {
      console.log('Processing file:', file.path);
    }
    cb(null, file);
  });
}

function createCacheEntry(file, enc, cb) {
  // Create a cache entry for the file.
  // The key is the md5 hash of the file contents.
  // The cache file is static/imagemin-cache.json.
  //
  // Note: We can use MD5 here because being cryptographically secure is not
  // a requirement. We just need a fast hash function to compare file contents.
  const hash = crypto.createHash('md5');
  hash.update(file.contents);
  const hex = hash.digest('hex');
  if (debugFlag) {
    console.log(`Caching ${file.relative} (${hex})`);
  }
  cache[file.relative] = hex;
  cb(null, file);
}

function filterFromCache(file, enc, cb) {
  // Check if the file is in the cache.
  // If it is, skip it.
  const hash = crypto.createHash('md5');
  hash.update(file.contents);
  const hex = hash.digest('hex');
  if (cache[file.relative] === hex) {
    if (debugFlag) {
      console.log('Skipping', file.relative);
    }
    cb();
  } else {
    cb(null, file);
  }
}

function checkFile(file, enc, cb) {
  const hash = crypto.createHash('md5');
  hash.update(file.contents);
  const hex = hash.digest('hex');
  if (cache[file.relative] !== hex) {
    numFilesWithIssues++;
    filesWithIssues.push(file.relative);
  }
  cb();
}

async function imageMinifcation() {
  if (fs.existsSync('static/imagemin-cache.json')) {
    cache = JSON.parse(fs.readFileSync('static/imagemin-cache.json', 'utf8'));
  }

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
    check: {
      type: 'boolean',
      description: 'Check if images are already minified, fail otherwise.',
      default: false,
    },
  }).argv;

  debugFlag = argv.debug;

  check = argv.check;

  if (argv.info) {
    // Info about options was already displayed by yargs.help().
    return Promise.resolve();
  }

  const globs = argv.glob;
  if (argv.debug) {
    console.log('Globs being used:', globs);
  }
  debugFlag = argv.debug;

  const { default: imagemin } = await import('gulp-imagemin');

  return new Promise((resolve, reject) => {
    const task = gulp
      .src(globs, { base: './', encoding: false, followSymlinks: false })
      .pipe(logFiles(argv.debug))
      .pipe(through2.obj(filterFromCache));
    if (check) {
      task
        .pipe(through2.obj(checkFile))
        .pipe(gulp.dest(os.tmpdir()))
        .on('end', () => {
          if (numFilesWithIssues > 0) {
            console.error(
              `Found ${numFilesWithIssues} images that are not minified:`,
            );
            filesWithIssues.forEach((file) => {
              console.error(` - ${file}`);
            });
            reject(
              new Error(
                'Some images are not minified. Run `npm run fix:images` to fix.',
              ),
            );
          }
          resolve();
        })
        .on('error', reject);
    } else {
      task
        .pipe(imagemin())
        .pipe(through2.obj(createCacheEntry))
        .pipe(gulp.dest('.'))
        .on('end', () => {
          fs.writeFileSync(
            'static/imagemin-cache.json',
            JSON.stringify(cache, null, 2),
          );
          resolve();
        })
        .on('error', reject);
    }
  });
}

imageMinifcation.description = `Minify images in the project.`;

gulp.task('image-min', imageMinifcation);
