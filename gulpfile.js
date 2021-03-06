var gulp = require('gulp'),
       $ = require('gulp-load-plugins')(),
     seq = require('run-sequence'),
  Server = require('karma').Server;

var path = {
    scripts: ['./dev/commons/util.module.js',
              './dev/commons/delegate-handle.service.js',
              './dev/commons/listener.service.js',
              './dev/tag-input.module.js',
              './dev/tag-input.config.js',
              './dev/tag-list.directive.js',
              './dev/tag-input.directive.js',
              './dev/growing-input.directive.js',
             ],
    styles: ['./dev/*.scss']
};

gulp.task('script', function(){
    return gulp.src(path.scripts)
            .pipe($.concat('dist/tagInput.js'))
            .pipe(gulp.dest('.'));
});

gulp.task('script:min', function(){
    return gulp.src(path.scripts)
            .pipe($.uglify())
            .pipe($.concat('dist/tagInput.min.js'))
            .pipe(gulp.dest('.'));
});

gulp.task('style', function(){
    return gulp.src(path.styles)
            .pipe($.concat('dist/tagInput.scss'))
            .pipe(gulp.dest('.'));
});

gulp.task('test', function(done){
    new Server({
        configFile: __dirname + '/karma/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('test:min', function(done){
    new Server({
        configFile: __dirname + '/karma/karma-min.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('build', ['script', 'style']);
gulp.task('build:min', ['script:min', 'style']);
gulp.task('build:all', function(cb){
    seq('build', 'build:min', cb);
});
gulp.task('default', ['build:all']);
gulp.task('test:all', function(cb){
    seq('test', 'test:min', cb);
});
