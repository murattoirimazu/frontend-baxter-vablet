var gulp = require('gulp'),
    sass = require('gulp-sass'),
    data = require('gulp-data'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    fileinclude = require('gulp-file-include'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    notify = require('gulp-notify'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    watch = require('gulp-watch'),
    iconfont = require('gulp-iconfont'),
    iconfontcss = require('gulp-iconfont-css'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    runSequence = require('run-sequence'),
    rename = require('gulp-rename'),
    gulpif = require('gulp-if'),
    del = require('del'),
    fs = require('fs'),
    zip = require('gulp-zip');

var isBuild = false;
var notifyError = function(err, lang) {
  console.log(err);
  notify.onError({
    title: lang + " error",
    // subtitle: "Error!",
    message: "Check console",
    sound: "Basso"
  })(err);
};

gulp.task('generate-html', function() {
  return gulp.src('src/index.html')
    .pipe( browserSync.reload( {stream:true} ) )
    // .pipe( notify( { message: 'Html task complete' } ) );
});

gulp.task('sass', function(){
  return gulp.src('./src/sass/*.{scss,sass}')
    .pipe( gulpif( isBuild, sourcemaps.init() ) )
    .pipe( sass() )
    .pipe( autoprefixer( {
      browsers: ['ie 9', 'last 4 Chrome versions', 'iOS > 5'],
      cascade: true
    }))
    .pipe( gulpif( isBuild, sourcemaps.write() ) )
    .pipe( gulp.dest('src/css') )
    .pipe( browserSync.reload( {stream:true} ) )
    // .pipe(notify({ message: 'Sass task complete' }));
});

gulp.task('html', function() {
  return gulp.src('src/html/pages/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
    }))
    .on("error", function(err) {
      notifyError(err, "HTML")
    })
   .pipe(gulp.dest('src/'));
   //.pipe(reload({stream:true}));
});

gulp.task('scripts', function() {
  return gulp.src([
      'src/js/lib/jquery-2.1.3.js',
      'src/js/lib/fastclick.js',
      'src/js/lib/owl.carousel.js',
      'src/js/lib/countUp.min.js',
      'src/js/global.js',
      'src/js/owl-init.js',
      'src/js/side-nav.js',
      'src/js/form.js',
      'src/js/checklist.js'
    ])
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    // .pipe(gulp.dest('www/js'))
    //.pipe(rename({ suffix: '.min' }))
    // .pipe(uglify())
    .pipe(gulp.dest('src/js'))
    .pipe( browserSync.reload( {stream:true} ) )
    // .pipe(notify({ message: 'Scripts task complete' }));
});

// Images
gulp.task('images', function() {
  return gulp.src('src/img/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('www/img'))
    .pipe( browserSync.reload( {stream:true} ) )
    .pipe(notify({ message: 'Images task complete' }));
});


//use pngquant instead
gulp.task('img-optim', function(){
  return gulp.src('src/img/**/{,*/}*.{jpg,gif,png}')
  .pipe(imagemin({
      progressive: true,
      progressive: true,
      interlaced: true,
      use: [pngquant()]
  }))
  .pipe(gulp.dest('dist/img/'));
});

var fontName = 'Icons';

gulp.task('iconfont', function(){
  gulp.src(['src/svg/*.svg'])
    .pipe(iconfontcss({
      fontName: fontName,
      path: './node_modules/gulp-iconfont-css/templates/_icons.scss',
      targetPath: '../../sass/utilities/_icons.scss',
      fontPath: '../fonts/icons/'
    }))
    .pipe(iconfont({
      fontName: fontName,
      fixedWidth: true,
      centerHorizontally: true,
      normalize: true,
      fontHeight:1000,
      descent: 0
     }))
    .pipe(gulp.dest('src/fonts/icons/'));
});

gulp.task('makeicons', function(callback) {
  runSequence('iconfont', 'sass', 'html');
});


// Clear cache
gulp.task('clearCache', function() {
  // Or, just call this for everything
  cache.clearAll();
});

// Clean
//gulp.task('clean', function(cb) {
//    del(['www/styles', 'www/js', 'www/img'], cb)
//});

gulp.task('zip', ['copy'], function () {
  return gulp.src('dist/**/*')
      .pipe(zip('dist.zhtml'))
      .pipe(gulp.dest('dist/'));
});

gulp.task('zip2', function () {
  return gulp.src('dist/**/*')
      .pipe(zip('dist.zhtml'))
      .pipe(gulp.dest('dist/'));
});

gulp.task('copy', ['sass', 'html', 'scripts'], function() {
  del.sync(['dist/**'], function (err, paths) {
    console.log('Deleted files/folders:\n', paths.join('\n'));
  });
  return gulp.src(['src/**', '!src/sass{,/**}'], {base: './src/'})
    .pipe(gulp.dest('dist/'));
  });


gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./src/"
    },
    open: false,
    ghostMode: false
  });
});

gulp.task('default', ['sass', 'html', 'scripts', 'browser-sync'], function () {
  gulp.watch("src/sass/**/*.scss", ['sass']);
  gulp.watch("src/js/**/*.js", ['scripts']);
  gulp.watch("src/**/*.html", ['html', browserSync.reload]);
});

gulp.task('dist', ['sass', 'html', 'scripts', 'copy', 'zip'], function(){});

gulp.task('build', function(callback) {
  runSequence('copy', 'img-optim', 'zip2');
});
