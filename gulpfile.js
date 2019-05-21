/**
 * 配置
 */
var virtualDrive = 'z';  //虚拟机盘符

//引入插件
var gulp = require('gulp'),
/*    cleanCss = require('gulp-clean-css'),*/
    cleanCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    less = require('gulp-less'),
    plumber = require('gulp-plumber'), // less报错时不退出watch
    connect = require('gulp-connect'),
    clean = require('gulp-clean'),
    fs = require('fs'), //获取真实路径
    runSequence = require('run-sequence'),
    rev = require('gulp-rev-params'),  
    revCollector = require('gulp-rev-collector-params'),
    gulpif = require('gulp-if'),
    changed = require('gulp-changed'),
    debug = require('gulp-debug'),
    sourcemaps = require('gulp-sourcemaps');

const babel = require('gulp-babel');
const removeUseStrict = require("./lib/gulp-remove-babel-use-strict.js");
const pcBabelIgnoreFiles = ['plupload', 'RongIMLib']

// 任务处理的文件路径配置
var src = {
        js: [
            fs.realpathSync('../static_guojiang_tv/src/mobile/js') + '/**/*.js'
        ],
        css: [
            fs.realpathSync('../static_guojiang_tv/src/mobile/css') + '/**/*.less'
        ],
        img: [
            '../static_guojiang_tv/src/mobile/img/**'
        ],
        base: '../static_guojiang_tv/src/mobile/'
    },
    dest = {
        jscss: [
            fs.realpathSync('../static_guojiang_tv/mobile/js') + '/**/*.js',
            fs.realpathSync('../static_guojiang_tv/mobile/css') + '/**/*.css'
        ]
    },
    pc_src = {
        js: [
            fs.realpathSync('../static_guojiang_tv/src/pc/js') + '/**/*.js'
        ],
        less: [
            fs.realpathSync('../static_guojiang_tv/src/pc/css') + '/**/*.less'
        ],
        css: [
            fs.realpathSync('../static_guojiang_tv/src/pc/css') + '/**/*.css'
        ],
        cssall: [
            fs.realpathSync('../static_guojiang_tv/src/pc/css') + '/**'
        ],
        img: [
            '../static_guojiang_tv/src/pc/img/**'
        ],
        base: '../static_guojiang_tv/src/pc/'
    },
    pc_dest = {
        jscss: [
            fs.realpathSync('../static_guojiang_tv/pc/v3/js') + '/**/*.js',
            fs.realpathSync('../static_guojiang_tv/pc/v3/css') + '/**/*.css'
        ]
    },
    output = '../static_guojiang_tv/mobile',
    pc_output = '../static_guojiang_tv/pc/v3';

var isRelease = false;

/*--------------------- mobile --------------------*/
/*清除*/
gulp.task('clean', function(){
    return gulp.src(dest.jscss, {read: false})
        .pipe(clean({force: true}));
})

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

gulp.task('less', function(){

    return gulp.src(src.css, {base: src.base })
        .pipe( gulpif(!isRelease, changed(output, {extension: '.css'}) ) )
        .pipe(less()).on('error', errorHandler)
        .pipe(plumber())
        .pipe( gulpif(isRelease, cleanCss()) )
        .pipe( gulpif(isRelease, rev() ) )
        .pipe(debug({title: 'css:'}))
        .pipe(gulp.dest(output))
        .pipe( gulpif(isRelease, rev.manifest() ) )
        .pipe( gulpif(isRelease, gulp.dest('./rev/mobile/css/') ) );
});

gulp.task('images', function(){

    return gulp.src(src.img, {base: src.base })
        .pipe(gulpif(!isRelease, changed(output)) )
        .pipe(rev())
        .pipe(gulp.dest(output))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/mobile/img/'));

});
gulp.task('rev', function() {
    gulp.src(['./rev/mobile/**/*.json', virtualDrive+ ':/videochat/web/protected/modules/mobile/views/**/*.php' ]) 
        .pipe( revCollector({
            replaceReved: true
        }) )      
        .pipe(gulp.dest( fs.realpathSync(virtualDrive+ ':/videochat/web/protected/modules/mobile/views/') ));

    gulp.src(['./rev/mobile/img/*.json', '../static_guojiang_tv/mobile/css/*' ])  
        .pipe( revCollector({
            replaceReved: true
        }) )   
        .pipe(gulp.dest( fs.realpathSync('../static_guojiang_tv/mobile/css/') ));

    gulp.src(['./rev/mobile/img/*.json', '../static_guojiang_tv/mobile/js/*' ])  
        .pipe( revCollector({
            replaceReved: true
        }) )   
        .pipe(gulp.dest( fs.realpathSync('../static_guojiang_tv/mobile/js/') ));     
});

/* 测试和线上环境 */
gulp.task('release', function() {
    isRelease = true;
    return runSequence(
            ['images','less', 'scripts'], 
            ['rev']
        );
});

/* 本地开发环境 */
gulp.task('dev', function(){

    return runSequence(
            ['images','less', 'scripts'], 
            function(){

                var less_watcher = gulp.watch(src.css, ['less']);
                less_watcher.on('change', function(event) {
                  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
                })

                var js_watcher = gulp.watch(src.js, ['scripts']);
                js_watcher.on('change', function(event) {
                  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
                })

            }
        );

});

gulp.task('default', function(){
    gulp.start('dev');
})

/*------------------------------- PC -------------------------------------*/

/*清除*/
gulp.task('pc_clean', function(){
    return gulp.src(pc_dest.jscss, {read: false})
        .pipe(clean({force: true}));
})

function babelFilter(file){
    var isFilterFile =  pcBabelIgnoreFiles.some(function(val){
        return file.history[0].indexOf(val) != -1
    })
    return !isFilterFile
}

gulp.task('pc_scripts', function(){
    return gulp.src(pc_src.js, {base: pc_src.base })
        .pipe(gulpif(!isRelease, changed(pc_output) ) )
        .pipe(gulpif(babelFilter, babel()) ).on('error', errorHandler)
        .pipe(removeUseStrict())
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

gulp.task('pc_less', function(){
    
    return gulp.src(pc_src.less, {base: pc_src.base })
        .pipe(gulpif(!isRelease, changed(pc_output , {extension: '.css'}) ) )
        .pipe(plumber())
        .pipe(less()).on('error', errorHandler)
        .pipe( gulpif(isRelease, cleanCss({compatibility: 'ie7'})) )
        .pipe(rev())
        .pipe(debug({title: 'css:'}))
        .pipe(gulp.dest(pc_output))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/pc/css/'));
});
gulp.task('pc_css', function(){

    return gulp.src(pc_src.css, {base: pc_src.base })
        .pipe( gulpif(!isRelease, changed(pc_output , {extension: '.css'} )) )
        .pipe(plumber())
        .pipe( gulpif(isRelease, cleanCss({compatibility: 'ie7'})) )
        .pipe(rev())
        .pipe(debug({title: 'css:'}))
        .pipe(gulp.dest(pc_output))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/pc/css/'));
});

gulp.task('pc_images', function(){

    return gulp.src(pc_src.img, {base: pc_src.base })
        .pipe(gulpif(!isRelease, changed(pc_output )) )
        .pipe(rev())
        .pipe(gulp.dest(pc_output))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/pc/img/'));

});
gulp.task('pc_rev', function() {
    gulp.src(['./rev/pc/**/*.json', virtualDrive+ ':/videochat/web/protected/views/**/*.php' ]) 
        .pipe( revCollector({
            replaceReved: true
        }) )      
        .pipe(gulp.dest( fs.realpathSync(virtualDrive+ ':/videochat/web/protected/views/') ));

    gulp.src(['./rev/pc/img/*.json', '../static_guojiang_tv/pc/v3/css/*' ])  
        .pipe( revCollector({
            replaceReved: true
        }) )   
        .pipe(gulp.dest( fs.realpathSync('../static_guojiang_tv/pc/v3/css/') ));

    gulp.src(['./rev/pc/img/*.json', '../static_guojiang_tv/pc/v3/js/*' ])  
        .pipe( revCollector({
            replaceReved: true
        }) )   
        .pipe(gulp.dest( fs.realpathSync('../static_guojiang_tv/pc/v3/js/') ));     
});


/* 测试 和 线上环境 */
gulp.task('pc_release', function() {
    isRelease = true;
    return runSequence(
            ['pc_images','pc_less','pc_css', 'pc_scripts'], 
            ['pc_rev']
        );
});

/* 本地开发环境 */
gulp.task('pc_dev', function(){

    return runSequence(
            ['pc_images','pc_less','pc_css', 'pc_scripts'], 
            function(){
                //watch监听需要监听路径，不能监听具体后缀名文件，所以此处用cssall
                var less_watcher = gulp.watch(pc_src.cssall, ['pc_less']);
                less_watcher.on('change', function(event) {
                  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
                })

                var js_watcher = gulp.watch(pc_src.js, ['pc_scripts']);
                js_watcher.on('change', function(event) {
                  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
                })

            }
        );

});

/***************** 移动待发布文件到trunk ***********************/

var file = './file.txt';
gulp.task('copybeta', function() {
    fs.readFile(file, function(err, obj){
        console.log('err:', err);
        var obj = obj.toString().replace(/\s{2,}/g, '\n').replace(/(^\s+)|(\s+$)/g, '').split('\n');

        for(var i = 0; i< obj.length; i++){

            var srcFile = obj[i].replace(/\s+/g,'');
            
            if(srcFile.indexOf('.') == -1){
                srcFile = srcFile + '/**/*.*' ;
            }
            console.log('dir:', srcFile);

            if(srcFile.indexOf('static_guojiang_tv') != -1){
                srcFile = '../' + srcFile;
                //base: srcFile 去掉base的路径，对接上dest的路径
                gulp.src(srcFile, {base: '../static_guojiang_tv'})    
                    .pipe(debug({title: 'static:'}))
                    .pipe(gulp.dest( fs.realpathSync('../beta/static') ));
            }else{
                srcFile = virtualDrive+ ':/' + srcFile;
                gulp.src(srcFile, {base: virtualDrive+ ':/'})    
                    .pipe(debug({title: 'videochat:'}))
                    .pipe(gulp.dest( fs.realpathSync('../beta') ));
            }
            
        }
        
    })  


});

gulp.task('copytrunk', function() {
    fs.readFile(file, function(err, obj){
        console.log('err:', err);
        var obj = obj.toString().replace(/\s{2,}/g, '\n').replace(/(^\s+)|(\s+$)/g, '').split('\n');

        for(var i = 0; i< obj.length; i++){

            var srcFile = obj[i].replace(/\s+/g,'');
            
            if(srcFile.indexOf('.') == -1){
                srcFile = srcFile + '/**/*.*' ;
            }
            console.log('dir:', srcFile);

            if(srcFile.indexOf('maps') != -1) continue;

            if(srcFile.indexOf('static_guojiang_tv') != -1){
                srcFile = '../' + srcFile;
                gulp.src(srcFile, {base: '../static_guojiang_tv'})
                    .pipe(debug({title: 'static:'}))
                    .pipe(gulp.dest( fs.realpathSync('../trunk/static') ));
            }else{
                srcFile = virtualDrive+ ':/' + srcFile;
                gulp.src(srcFile, {base: virtualDrive+ ':/'})    
                    .pipe(debug({title: 'videochat:'}))
                    .pipe(gulp.dest( fs.realpathSync('../trunk') ));
            }
            
        }
        
    })  


});


/****************************PC old less2css******************************/
gulp.task('pc_old', function(){

    return gulp.src('../static_guojiang_tv/pc/css/**/*.less')
        .pipe(less()).on('error', errorHandler)
        .pipe(plumber())
        .pipe( gulpif(isOldRelease, cleanCss({compatibility: 'ie7'})) )
        .pipe(debug({title: 'css:'}))
        .pipe(gulp.dest('../static_guojiang_tv/pc/css'));
});
gulp.task('pc_old_dev', function(){
    isOldRelease = false;
    gulp.start('pc_old');

    var less_watcher = gulp.watch('../static_guojiang_tv/pc/css/**/*.less', ['pc_old']);
    less_watcher.on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    })
});
gulp.task('pc_old_release', function(){
    isOldRelease = true;
    gulp.start('pc_old');
});


//使用connect启动一个Web服务器
gulp.task('server', function () {
  connect.server();
});

/*错误处理*/
function errorHandler (error) {
  console.log(error.toString());
  this.emit('end');
}