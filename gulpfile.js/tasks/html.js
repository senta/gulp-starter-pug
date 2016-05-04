var config       = require('../config');
if(!config.tasks.html) return;

var browserSync  = require('browser-sync');
var data         = require('gulp-data');
var gulp         = require('gulp');
var gulpif       = require('gulp-if');
var handleErrors = require('../lib/handleErrors');
var htmlmin      = require('gulp-htmlmin');
var path         = require('path');
var render       = require('gulp-pug');
var fs           = require('fs');
var JSON5        = require('json5');

var exclude = path.normalize('!**/{' + config.tasks.html.excludeFolders.join(',') + '}/**');

var paths = {
  src: [path.join(config.root.src, config.tasks.html.src, '/**/*.' + config.tasks.html.extensions + ''), exclude],
  dest: path.join(config.root.dest, config.tasks.html.dest)
};

var getData = function(file) {
  var dataDir = path.resolve(config.root.src, config.tasks.html.src, config.tasks.html.dataDir);
  var templateDir = path.resolve(config.root.src, config.tasks.html.src);
  var pageJson = file.path.substr(templateDir.length + 1).replace(new RegExp('(' + config.tasks.html.extensions.join('|')+ ')$'), 'json');

  return ['global.json', pageJson].reduce(function (obj, json) {
    try {
      return Object.assign(obj, JSON5.parse(fs.readFileSync(path.join(dataDir, json), 'utf8')));
    } catch (e) {
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
    return obj;
  }, {});
};

 var htmlTask = function() {
  return gulp.src(paths.src)
    .pipe(data(getData))
    .on('error', handleErrors)
    .pipe(render({
      basedir: path.join(config.root.src, config.tasks.html.src),
      compileDebug: !global.production,
      pretty: '  '
    }))
     .on('error', handleErrors)
     .pipe(gulpif(global.production, htmlmin(config.tasks.html.htmlmin)))
     .pipe(gulp.dest(paths.dest))
     .pipe(browserSync.stream());

};

gulp.task('html', htmlTask);
module.exports = htmlTask;
