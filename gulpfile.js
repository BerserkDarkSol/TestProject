var
    env = require('minimist')(process.argv.slice(2)),
    gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    gulpif = require('gulp-if'),
    connect = require('gulp-connect'),
    modRewrite = require('connect-modrewrite'),
    imagemin = require('gulp-imagemin'),
    include = require("gulp-include"),
    del = require('del'),
    less = require('gulp-less'),
    LessPluginCleanCSS = require('less-plugin-clean-css'),
    CacheBuster = require('gulp-cachebust'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix');   // del less-plugin-clean-css gulp-cachebust less-plugin-autoprefix


var
    srcDir = 'src/',
    buildDir = 'build/',
    assetsDir = buildDir + 'assets/',
    cleancss = new LessPluginCleanCSS({
        advanced: true
    }),
    autoprefix = new LessPluginAutoPrefix({
        browsers: ["last 2 versions"]
    });

var cachebust = new CacheBuster();

gulp.task('less', function () {
    return gulp.src(srcDir + 'style/main.less')
        .pipe(less({
            plugins: [autoprefix, cleancss]
        }))
        .on('error', function (error) {
            console.log(error.toString());
            this.emit('end');
        })
        // .pipe(cachebust.resources())
        .pipe(gulp.dest(assetsDir + 'css'))
        .pipe(connect.reload());
});

gulp.task('font', function() {
    return gulp.src(srcDir + 'fonts/**/*')
        .pipe(gulp.dest(assetsDir + 'fonts'))
        .pipe(connect.reload());
});

gulp.task('fa-font', function () {
    return gulp.src('bower_components/font-awesome/fonts/*')
        .pipe(gulp.dest(assetsDir + 'fonts'))
        .pipe(connect.reload());
});

gulp.task('js', function () {
    return gulp.src(srcDir + 'js/**/*.js')
        .pipe(concat('main.js'))
        .pipe(include())
        .on('error', console.log)
        .pipe(gulpif(env.p, uglify()))
        .pipe(gulp.dest(assetsDir + 'js/'))
        .pipe(connect.reload());
});

gulp.task('img', function () {
    return gulp.src(srcDir + 'img/**/*')
        .pipe(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))
        .pipe(gulp.dest(assetsDir + 'img'))
        .pipe(connect.reload());
});

gulp.task('html', ['less'], function () {
    gulp.src([srcDir + 'html/index.html'])
        .pipe(include())
        .on('error', console.log)
        // .pipe(cachebust.references())
        .pipe(gulp.dest('./' + buildDir))
        .pipe(connect.reload());
});

gulp.task('clean', function () {
    return del([
        buildDir + '**/*'
    ]);
});


// Call Watch
gulp.task('monitor', function () {
    gulp.watch(srcDir + 'style/**/*.less', ['less']);
    gulp.watch(srcDir + 'js/**/*.js', ['js']);
    gulp.watch(srcDir + 'html/**/*.html', ['html']);
    gulp.watch(srcDir + 'img/**/*.{jpg,png,gif}', ['img']);
});

// Connect (Livereload)
gulp.task('connect', function () {
    connect.server({
        root: [buildDir],
        livereload: true,
        middleware: function () {
            return [
                modRewrite([
                    '^/$ /index.html',

                    '^([^\\.]+)$ $1.html'
                ])
            ];
        }
    });
});

// Default task
gulp.task('watch', ['default', 'connect', 'monitor']);

// Default task
gulp.task('default', ['html', 'js', 'img', 'font', 'fa-font']);
