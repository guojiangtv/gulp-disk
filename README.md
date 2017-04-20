# gulp
虚拟机内gulp

2017-04-20 
增加sourcemap

``
var sourcemaps = require('gulp-sourcemaps');

gulp.task('scripts', function(){
    return gulp.src(src.js, {base: src.base })
        .pipe( gulpif(!isRelease, changed(output) ) )
.pipe( gulpif(isRelease, sourcemaps.init() ) )
        .pipe( gulpif(isRelease, uglify()) )
        .on('error', errorHandler)
        .pipe( gulpif(isRelease, rev() ) )
        .pipe(debug({title: 'js:'}))
.pipe( gulpif(isRelease, sourcemaps.write('./maps') ) )
        .pipe(gulp.dest(output))
        .pipe( gulpif(isRelease, rev.manifest() ) )
        .pipe( gulpif(isRelease, gulp.dest('./rev/mobile/js/') ) );
});


gulp.task('pc_scripts', function(){
    return gulp.src(pc_src.js, {base: pc_src.base })
        .pipe(gulpif(!isRelease, changed(pc_output) ) )
.pipe( gulpif(isRelease, sourcemaps.init() ) )
        .pipe( gulpif(isRelease, uglify()) )
        .on('error', errorHandler)
        .pipe(rev())
        .pipe(debug({title: 'js:'}))
.pipe( gulpif(isRelease, sourcemaps.write('./maps') ) )
        .pipe(gulp.dest(pc_output))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/pc/js/'));
});

``