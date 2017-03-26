var gulp = require('gulp'),
  del = require('del'),
  browserify = require('browserify'),
  babelify = require('babelify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  runSequence = require('run-sequence'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  plugins = gulpLoadPlugins();

const vendors = [
  'angular',
  'angular-ui-router',
  'bootstrap'
];

var config = {
  index: 'app/index.html',
  entry: 'app/js/app.js',
  js: 'app/js/**/*.js',
  images: 'app/images/*.*',
  fonts: 'app/fonts/*.*',
  html: 'app/**/*.html',
  styles: 'app/css/*.css'
}

var dist = {
  path: 'dist/',
  images: 'images/',
  fonts: 'fonts/',
  vendors: 'vendors/',
  styles: 'css/',
  scripts: 'js/'
}

gulp.task('dev', function () {
  runSequence(
    'clean',
    'vet', ['buildDev', 'copy-fonts', 'copy-images', 'stylesDev']
  );
});

gulp.task('prod', function () {
  runSequence(
    'clean',
    'vet', ['buildProd', 'copy-fonts', 'copy-images', 'stylesProd']
  );
});

gulp.task('clean', function () {
  return gulp.src(dist.path + '*')
    .pipe(plugins.rimraf());
});

gulp.task('vet', function () {
  return gulp.src([config.js])
    .pipe(plugins.jshint())
    .pipe(plugins.jscs())
    .pipe(plugins.jshint.reporter('jshint-stylish'), {
      verbose: true
    })
    .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('dependencies', function () {
  return gulp.src([config.index])
    .pipe(plugins.htmlDependencies({
      dest: dist.path,
      prefix: dist.vendors
    }))
    .pipe(gulp.dest(dist.path));
});

// DEV
gulp.task('stylesDev', function () {
  return gulp.src([config.styles])
    .pipe(gulp.dest(dist.path + dist.styles))
});

gulp.task('buildDev', ['dependencies'], function () {
  return browserify({
      entries: [config.entry],
      extensions: ['.js'],
      debug: true
    })
    .external(vendors)
    .transform('babelify', {
      presets: ['es2015']
    })
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest(dist.path + dist.scripts))
    /*.pipe(plugins.livereload())*/;
});

// PROD
gulp.task('stylesProd', function () {
  return gulp.src([config.styles])
    .pipe(plugins.cleanCss())
    .pipe(gulp.dest(dist.path + dist.styles))
});

gulp.task('buildProd', ['dependencies'], function () {
  return browserify({
      entries: [config.entry],
      extensions: ['.js'],
      debug: true
    })
    .external(vendors)
    .transform('babelify', {
      presets: ['es2015']
    })
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.uglify())
    .pipe(gulp.dest(dist.path + dist.scripts))
    /*.pipe(plugins.livereload())*/;
});

gulp.task('copy-images', ['clean-images'], function () {
  return gulp.src([config.images])
    .pipe(gulp.dest(dist.path + dist.images));
});

gulp.task('copy-fonts', ['clean-fonts'], function () {
  return gulp.src([config.fonts])
    .pipe(gulp.dest(dist.path + dist.fonts));
});

gulp.task('clean-images', function () {
  del(dist.path + dist.images);
});

gulp.task('clean-fonts', function () {
  del(dist.path + dist.fonts)
});

gulp.task('clean-js', function () {
  del(dist.path + dist.js)
});

gulp.task('clean-styles', function () {
  del(dist.path + dist.css)
});