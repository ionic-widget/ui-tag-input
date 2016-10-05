var gulp = require('gulp'),
       $ = require('gulp-load-plugins')(),
  Server = require('karma').Server;

var path = {
    scripts: ['./dev/fishbone.js',
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
            .pipe($.uglify())
            .pipe($.concat('tagInput.min.js'))
            .pipe(gulp.dest('.'));
});

gulp.task('style', function(){
    return gulp.src(path.styles)
            .pipe($.concat('tagInput.scss'))
            .pipe(gulp.dest('.'));
});

gulp.task('test', function(done){
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('build', ['script', 'style']);
gulp.task('default', ['build']);
