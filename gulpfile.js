const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const jade = require('gulp-jade');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const minify = require('gulp-minify-css');

const os = require('os');
const browser = os.platform() === 'linux' ? 'google-chrome' : (os.platform() === 'darwin' ? 'google chrome' : (os.platform() === 'win32' ? 'chrome' : 'firefox'));

const config = {
  files: {
    build: {
      css: 'build/css/main.css'
    },
    server: 'server.js',
    all: {
      src: 'src/**/*.*',
      build: 'build/**/*.*',
      jade: 'src/**/*.jade',
      less: 'src/assets/stylesheets/**/*.less',
      images: [
        'src/assets/images/**/*.jpg',
        'src/assets/images/**/*.jpeg',
        'src/assets/images/**/*.png',
        'src/assets/images/**/*.gif',
        'src/assets/images/**/*.svg'
      ]
    },
    stylesheets: [
      './node_modules/bootstrap/dist/css/bootstrap.css',
      'src/assets/stylesheets/main.less'
    ],
    jade: {
      index: './src/index.jade'
    },
    main: {
      less: './src/assets/stylesheets/main.less'
    }
  },
  browserSync: {
    proxy: `http://localhost:5555`,
    files: ['build/**/*.*'],
    browser: browser,
    port: 7777
  },
};

//Gulp compile-jade task: jade -> html
gulp.task('compile-jade', () => {
  gulp.src(config.files.jade.index)
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./build'));
});


//Gulp css task - handles css stuff(compiling less, autoprefixer, bundling with library files, minification and concatenation )
gulp.task('css', () => {
  gulp.src(config.files.stylesheets)
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(concat('main.css'))
    // .pipe(minify()) TODO Enable for production
    .pipe(gulp.dest('./build/css'))
});

//Copy assets task images into build folder
gulp.task('copy-assets', () => {
  gulp.src(config.files.all.images)
    .pipe(gulp.dest('./build/images'));
});

//Gulp dev-server task: starts express server
gulp.task('dev-server', ['compile-jade', 'css', 'copy-assets'], (cb) => {

  let started = false;

  return nodemon({
    script: config.files.server,
    ignore: [
      config.files.all.src,
      config.files.all.build
    ]
  }).on('start', () => {
    console.log(`Dev server: started ${new Date().toLocaleString()}`);
    // to avoid nodemon being started multiple times
    if (!started) {
      cb();
      started = true;
    }

  }).on('restart', () => console.log(`Dev server: restarted ${new Date().toLocaleString()}`));
});

//Gulp serve task - initializes browser synchronization
gulp.task('serve', ['dev-server'], function() {
  browserSync.init(null, config.browserSync);
});

gulp.task('watch', ['serve'], () => {
  gulp.watch(config.files.all.jade, ['compile-jade']);
  gulp.watch(config.files.all.less, ['css']);
});

gulp.task('default', ['watch']);