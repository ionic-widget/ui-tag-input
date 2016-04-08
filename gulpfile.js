var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var angularFilesort = require('gulp-angular-filesort');

var path = {
    scripts: ['./dev/*.js'],
    styles: ['./dev/*.scss']
};

gulp.task('script', function(){
    return gulp.src(path.scripts)
            .pipe(angularFilesort())
            .pipe(ngAnnotate())
            .pipe(uglify())
            .pipe(concat('tagInput.min.js'))
            .pipe(gulp.dest('.'));
});

gulp.task('style', function(){
    return gulp.src(path.styles)
            .pipe(concat('tagInput.scss'))
            .pipe(gulp.dest('.'));
});

gulp.task('build', ['script', 'style']);
gulp.task('default', ['build']);
