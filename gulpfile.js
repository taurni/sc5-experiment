
// Imports

var gulp = require('gulp');
var sass = require('gulp-sass');
var styleguide = require('sc5-styleguide');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var sq = require('gulp-sequence');
var del = require('del');
var concat = require('gulp-concat');
var jscs = require('gulp-jscs');

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

var jsWild = sourcePath + '/**/*.js';

var tmpPath = 'tmp';
var styleguideTmpPath = tmpPath + '/styleguide';

var projectName = 'Telekom Styleguide';

var sc5StyleguideGemini = require('sc5-styleguide-visualtest');

gulp.task("test:visual:config", function() {
  gulp.src('tests/styleguide', { read: false })
    .pipe(sc5StyleguideGemini.configure({
      excludePages: [
        // '2.2.1', // Back icon is not shown in prod
        // '6.1-2', // picture is not loaded in prod
      ]
    }))
    .pipe(gulp.dest('./tests/visual/config'))  // Path to configuration and tests
});

gulp.task("test:visual:update", ["test:visual:config"], function() {
  gulp.src('tests/styleguide', { read: false })
    .pipe(sc5StyleguideGemini.gather({
      configDir: 'tests/visual/config', // Path to configuration and tests
      gridScreenshotsDir: 'tests/visual/grid-screenshots',
      rootUrl: 'http://127.0.0.1:3000'
    }));
});

gulp.task("visual:test", function(done){
  gulp.src('tests/styleguide', { read: false })
    .pipe(sc5StyleguideGemini.test({
      configDir: 'tests/visual/config',
      gridScreenshotsDir: 'tests/visual/grid-screenshots',
      rootUrl: 'http://127.0.0.1:3000'
    }));
});

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
gulp.task('sequenceScripts', function(callback){
    sq( 'jsLint','scripts', 'styleguide')(callback)
});
// Concat all components javascript
gulp.task('scripts', function() {
    return gulp.src('./src/components/**/*.js')
        .pipe(concat('app.js'))
        .pipe(gulp.dest(styleguideTmpPath + '/assets/js/'));
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
        title: projectName,
        rootPath: styleguideBuildPath,
        appRoot: styleguideAppRoot,
        overviewPath: overviewPath
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
        title: projectName,
        server: true,
        rootPath: styleguideTmpPath,
        overviewPath: overviewPath,
          extraHead: [
              '<script src="http://yandex.st/jquery/1.7.2/jquery.min.js"></script>',
              '<script src="/assets/js/app.js"></script>'
          ],
          disableEncapsulation: true

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
gulp.task('dev', ['html', 'scripts', 'scss', 'styleguide'], function() {
    gulp.watch(jsWild, ['sequenceScripts']);
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




// check JSCS
gulp.task('jsLint:check',function(){
    return gulp.src(jsWild)
        .pipe(jscs())
        .pipe(jscs.reporter());
});

//check and fix
gulp.task('jsLint',function(){

    return gulp.src(jsWild)
        .pipe(jscs({fix: true}))
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'))
        .pipe(gulp.dest(sourcePath));
});
