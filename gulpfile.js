
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


/////////////////////////////////////////////////////////////////////

var
// Built in packages.
    spawn = require('child_process').spawn,

// Generic npm packages.
    async = require('async'),
    //del   = require('del'),
    index = require('serve-index'),

// The gulp related plugins.
//    gulp  = require('gulp'),
    serve = require('gulp-serve'),
    tap   = require('gulp-tap'),

// The port on which the local server should serve up the reports on.
    port = 3333,

// The folder in which the generated reports should be saved to.
    reportsDir = 'reports',

// A `glob` for where the Galen test suites can be found.
    suitesGlob = 'tests/specs/**/*.test';

// Clean out the directory where the reports will be saved to. This is done so
// as not to pollute the reports directory with old/potentially unwanted files.
gulp.task('clean', function () {
    return del([reportsDir]);
});

// This is the task that will kick off running all the Galen test suites.
gulp.task('test', ['clean'], function (done) {
    console.log(' TEST TASK')
    var
    // Here we create an empty Array to store vinyl File Objects.
        files = [],

    // Here we define a simple utility Function that we will call to
    // execute the Galen specs.
        galen = function galen (file, callback) {
            spawn('galen', [
                'test',
                file.path,
                '--htmlreport',
                reportsDir + '/' + file.relative.replace(/\.test/, '')
            ], {'stdio' : 'inherit'}).on('close', function () {
                callback();
            });
        };

    // Here we source our suites and immediately pass them to `gulp-tap`. The
    // `gulp-tap` plugin allows you to "tap into" each file that is streamed
    // into the pipe. We use this functionality to build up the `files` Array
    // and populate it with vinyl File Objects.
    //
    // Once `gulp-tap` has finished
    // doing its thing, we listen to the `end` event and then pass off the built
    // up `files` Array to `async.mapSeries`.
    //
    // This will sequentially iterate through the Array perform the first
    // callback and then when all items in the Array have been iterated over, it
    // will perform the next callback.
    //
    // The next callback executes the `done()` handler that tells gulp that we
    // are finished with this task and that we are good to continue with
    // whichever task in next in the queue.
    console.log('TASk')
    gulp.src([suitesGlob])
        .pipe(tap(function (file) {
            files.push(file);
        }))
        .on('end', function () {
            async.mapSeries(files, function (file, finished) {
                galen(file, finished);
            }, function () {
                done();
            });
        });
});

// Here we define a task to serve up the generated reports. This allows the
// generated HTML to be easily viewed in the browser, simply navigate to
// `http://localhost:[port]`. The value for the port is defined at the top of
// this file.
//
// This task requires that the `test` task is run first. This is so Galen can
// generate the required reports and present us with the files to display.
gulp.task('serve', ['test'], serve({
    'middleware' : function (req, res, next) {
        index(reportsDir, {
            'filter'     : false,
            'hidden'     : true,
            'icons'      : true,
            'stylesheet' : false,
            'template'   : false,
            'view'       : 'details'
        })(req, res, next);
    },
    'port' : port,
    'root' : reportsDir
}));

// And lastly, we define a `default` task to kick off if `gulp` is called with
// no additional arguments.
//
// If this happens, we then kick off the `serve` task which will in turn kick
// off the `test` task.
//
// Once this is all complete you can navigate to localhost in your browser and
// see the results of the tests.
// gulp.task('default', ['serve']);