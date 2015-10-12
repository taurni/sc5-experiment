
// Imports

var gulp = require('gulp');
var sass = require('gulp-sass');
var styleguide = require('sc5-styleguide');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var sq = require('gulp-sequence');
var del = require('del');

// Path definitions

var sourcePath = 'src';
var htmlWild = sourcePath + '/**/*.html';
var hbsWild = sourcePath + '/**/*.hbs';
var styleSourcePath = sourcePath + '';
var scssWild = styleSourcePath + '/**/*.scss';
var scssRoot = styleSourcePath + '/components/main.scss';
var overviewPath = styleSourcePath + '/README.md';

var buildPath = 'build';
var styleBuildPath = buildPath + '/styles';
var styleguideAppRoot = '/styleguide';
var styleguideBuildPath = buildPath + styleguideAppRoot;

var tmpPath = 'tmp';
var styleguideTmpPath = tmpPath + '/styleguide';

// Dealates all html files in src/**/
gulp.task('deleate:html',function(){
    return del([htmlWild]);
});

// Handlebars
gulp.task('handlebars',['deleate:html'], function () {
    var templateData = {
            firstName: 'Kaanon'
        },
        options = {
            ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false
            partials : {
                footer : '<footer>the end</footer>'
            },
            batch : ['./'+sourcePath], //partials
            helpers : {
                capitals : function(str){
                    return str.toUpperCase();
                },
                default : function(param, defaultValue){
                    //helper for adding param with default value
                    if(typeof param === 'undefined'){
                        return defaultValue
                    }else{
                        return param
                    }
                }
            }
        };

    return gulp.src(hbsWild)
        .pipe(handlebars(templateData, options))
        .pipe(rename({extname: ".html"}))
        .pipe(gulp.dest('src'));
});

gulp.task('sequence', function(callback){
    sq( 'html', 'styleguide')(callback)
});


// Building the application
//
// In reality the app would ofcourse be a lot more complex.
// Here the app simply consists of some HTML so we get to examine how
// the styles would be used in the application. A key relevation is
// that the markup needs to be written into the app. There is no magic
// that would bring the markup for a page into the app from the pages
// section in the styleguide.

//gulp.task( 'demotest', gulpSequence('html','styleguide') );

// TODO: callback styleguide task
gulp.task('html', ['handlebars'], function() {
    return gulp.src(htmlWild)
        .pipe(gulp.dest(buildPath));
});
gulp.task('scss', function() {
    return gulp.src(scssRoot)
        .pipe(sass())
        .pipe(gulp.dest(styleBuildPath));
});

// Building styleguide for static hosting to be displayed as a part of the application
//
// Here we build the styleguide so it can be included in a web folder within the app.
// The benefit for including the styleguide at /styleguide path of the app is that
// everyone can always find a master copy of the style guide. Another benefit is that
// this copy will be load balanced by the web server, so it can handle heavy loads.
// All interactive features are disabled to prevent users from tampering with the
// styles.

gulp.task('staticStyleguide:generate', function() {
  return gulp.src(scssWild)
    .pipe(styleguide.generate({
        title: 'My First Hosted Styleguide',
        rootPath: styleguideBuildPath,
        appRoot: styleguideAppRoot,
        overviewPath: overviewPath,
        extraHead: [
              '<script src="/buttons.js"></script>'
        ],
        disableEncapsulation: true
      }))
    .pipe(gulp.dest(styleguideBuildPath));
});

gulp.task('staticStyleguide:applystyles', function() {
  return gulp.src(scssRoot)
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(styleguideBuildPath));
});

gulp.task('staticStyleguide', ['staticStyleguide:generate', 'staticStyleguide:applystyles']);

// Running styleguide development server to view the styles while you are working on them
//
// This task runs the interactive style guide for use by developers. It runs a built-in server
// and contains all the interactive features and should be updated automatically whenever the
// styles are modified.

gulp.task('styleguide:generate', function() {
  return gulp.src(scssWild)
    .pipe(
      styleguide.generate({
        title: 'My First Development Styleguide',
        server: true,
        rootPath: styleguideTmpPath,
        overviewPath: overviewPath
     }))
    .pipe(gulp.dest(styleguideTmpPath));
});

gulp.task('styleguide:applystyles', function() {
  return gulp.src(scssRoot)
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(
      styleguide.applyStyles())
    .pipe(gulp.dest(styleguideTmpPath));
});

gulp.task('styleguide', ['styleguide:generate', 'styleguide:applystyles']);

// Developer mode

gulp.task('dev', ['html', 'scss', 'styleguide'], function() {
    gulp.watch(hbsWild, ['sequence']);
   // gulp.watch(htmlWild, ['html']);
    gulp.watch(scssWild, ['scss', 'styleguide']);
    console.log(
        '\nDeveloper mode!\n\nSC5 Styleguide available at http://localhost:3000/\n'
    );
});

// The basic build task

gulp.task('default', ['html', 'scss', 'staticStyleguide'], function() {
    console.log(
        '\nBuild complete!\n\nFresh build available in directory: ' +
        buildPath + '\n\nCheckout the build by commanding\n' +
        '(cd ' + buildPath + '; python -m SimpleHTTPServer)\n' +
        'and pointing yout browser at http://localhost:8000/\n' +
        'or http://localhost:8000/styleguide/ for the styleguide\n\n' +
        'Run gulp with "gulp dev" for developer mode and style guide!\n'
    );
});

// Helpers

