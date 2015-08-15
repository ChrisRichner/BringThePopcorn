var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');
var minifycss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var del = require('del');
var rename = require('gulp-rename');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var flatten = require('gulp-flatten');
var merge = require('merge-stream');

var onError = function(err) {
	notify.onError({
		title:    "Gulp",
		subtitle: "Failure!",
		message:  "Error: <%= error.message %>",
		sound:    "Beep"
	})(err);

	this.emit('end');
};


gulp.task('clean', function(cb) {
	//del(['Sources/prod'], cb)
});

gulp.task('styles', function() {
	return gulp.src(['**/*.less', '!bin/**/*.less', '!/bld/**/*.less'], { cwd: 'KodiPassion',  base : '.' })
	.pipe(plumber({errorHandler: onError}))
	.pipe(less())
	.pipe(gulp.dest(''));	
});

var tsKodiProject = ts.createProject({
    declarationFiles: true,
    noExternalResolve: true,
    target: 'ES5',
    noEmitOnError: false
});

gulp.task('compilekodi', function () {
    var tsResult = gulp.src([
		'KodiPassion/typings/**/*.d.ts',
		'KodiPassion/Kodi/**/*.ts',
    ], { base: '.' })
	.pipe(plumber({ errorHandler: onError }))
	.pipe(sourcemaps.init())
	.pipe(ts(tsKodiProject));

    return merge([
        tsResult.dts.pipe(flatten()).pipe(concat('kodi.d.ts')).pipe(gulp.dest('KodiPassion/dist')),
        tsResult.js
            .pipe(concat('kodi.js'))
        	.pipe(sourcemaps.write(".",{
        	    sourceRoot: function (file) {
        	        var sources = [];
        	        file.sourceMap.sources.forEach(function (s) {
        	            var filename = s.substr(s.lastIndexOf('/') + 1);
        	            console.log(filename)
        	            sources.push("../kodi/" + [filename]);
        	        });
        	        file.sourceMap.sources = sources;
                    return ' ';
                }
            }))
        	.pipe(gulp.dest('KodiPassion/dist'))
    ]);
});

gulp.task('compilewinjscontrib', function () {
    return merge([
        gulp.src([
		    'scripts/winjscontrib/js/winjscontrib.core.js',
            'scripts/winjscontrib/js/winjscontrib.ui.webcomponents.js',
            'scripts/winjscontrib/js/winjscontrib.winrt.core.js',
		    'scripts/winjscontrib/js/winjscontrib.winrt.upnp.js',
            'scripts/winjscontrib/js/winjscontrib.bindings.js',
            'scripts/winjscontrib/js/winjscontrib.date.utils.js',
            'scripts/winjscontrib/js/winjscontrib.ui.navigator.js',
            'scripts/winjscontrib/js/winjscontrib.ui.animation.js',
            'scripts/winjscontrib/js/winjscontrib.ui.elasticbutton.js',
            'scripts/winjscontrib/js/winjscontrib.ui.fowrapper.js',
            
        ], { base: '.', cwd: 'KodiPassion' })
	    .pipe(plumber({ errorHandler: onError }))
	    .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('winjscontrib-custom.js'))
        .pipe(sourcemaps.write(".", {
            sourceRoot: function (file) {
                var sources = [];
                file.sourceMap.sources.forEach(function (s) {
                    var filename = s.substr(s.lastIndexOf('/') + 1);
                    console.log(filename)
                    sources.push("../scripts/winjscontrib/js/" + [filename]);
                });
                file.sourceMap.sources = sources;
                return ' ';
            }
        }))
        .pipe(gulp.dest('KodiPassion/dist')),

        gulp.src([
		    'scripts/winjscontrib/css/winjscontrib.ui.css',
		    'scripts/winjscontrib/css/segoe.symbol.css',
        ], { base: '.', cwd: 'KodiPassion' })
	    .pipe(plumber({ errorHandler: onError }))
	    .pipe(sourcemaps.init())
        .pipe(minifycss())
        .pipe(concat('winjscontrib-custom.css'))
        .pipe(sourcemaps.write(".", {
            sourceRoot: function (file) {
                var sources = [];
                file.sourceMap.sources.forEach(function (s) {
                    var filename = s.substr(s.lastIndexOf('/') + 1);
                    console.log(filename)
                    sources.push("../scripts/winjscontrib/css/" + [filename]);
                });
                file.sourceMap.sources = sources;
                return ' ';
            }
        }))
        .pipe(gulp.dest('KodiPassion/dist'))
    ]);
});

gulp.task('watch', function() {
    gulp.watch(['KodiPassion/**/*.less', '!KodiPassion/**/bin/**/*.less', '!KodiPassion/**/bld/**/*.less'], ['styles']);
    gulp.watch(['KodiPassion/kodi/**/*.ts'], ['compilekodi']);
});

gulp.task('default', ['clean', 'styles'], function() {
});