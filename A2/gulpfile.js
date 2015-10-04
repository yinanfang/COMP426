'use strict';

// Sources:
// https://github.com/sogko/gulp-recipes/blob/master/browser-sync-nodemon-expressjs/gulpfile.js
// http://jbavari.github.io/blog/2014/06/11/unit-testing-angularjs-services/

var gulp = require('gulp');
var browserSync = require('browser-sync');
// var vulcanize = require('gulp-vulcanize');
// var runSequence = require('run-sequence');

gulp.task('browser-sync', function () {

  // for more browser-sync config options: http://www.browsersync.io/docs/options/
  browserSync.init({

    server: {
      baseDir: './src/',
    },

    // watch the following files; changes will be injected (css & images) or cause browser to refresh
    files: ['./**/*.*'],

    // informs browser-sync to proxy our expressjs app which would run at the following location
    // proxy: 'http://localhost:8080',

    // informs browser-sync to use the following port for the proxied app
    // notice that the default port is 3000, which would clash with our expressjs
    // port: 4000,

    // open the proxied app in chrome
    // browser: ['google chrome'],

    // Decide which URL to open automatically when Browsersync starts.
    // Defaults: "local" if none set.
    // Options: true, local, external, ui, ui-external, tunnel or false
    open: false,

    // Sync viewports to TOP position
    // scrollProportionally: false
  });

  // Open a specific url in browser
  // opn('https://www.google.com',{app: ['google chrome']});
  // opn('http://localhost:4000',{app: ['google chrome']});
});

// gulp.task('vulcanize', function() {

// });

gulp.task('default', function() {
  gulp.run('browser-sync');
});

