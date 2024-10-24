const gulp = require('gulp');

const usage = `
Usage:
  npx gulp --tasks # for a list of tasks
  npx gulp <task> --info for task argument info`;

const usageTask = (done) => {
  console.log(usage);
  done();
};

usageTask.description = 'Display usage instructions';

gulp.task('default', usageTask);
