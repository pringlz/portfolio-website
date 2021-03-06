const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const jade = require('gulp-jade');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const minify = require('gulp-minify-css');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const browserify = require('gulp-browserify');

const fs = require('fs');
const os = require('os');

const browser = os.platform() === 'linux' ? 'google-chrome' : (os.platform() === 'darwin' ? 'google chrome' : (os.platform() === 'win32' ? 'chrome' : 'firefox'));

const config = {
    files: {
        data: 'portfolio-data.json',
        server: 'server.js',
        all: {
            project: '**/*.*',
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
            ],
            fonts: [
                'node_modules/font-awesome/fonts/**/*.*'
            ],
            js: [
                'src/assets/scripts/**/*.js'
            ],
            documents: [
                'src/assets/documents/**/*.pdf'
            ]
        },
        entry: {
            jade: [
                './src/index.jade',
                './src/cv.jade'
            ],
            stylesheets: {
                landing: [
                    'node_modules/bootstrap/dist/css/bootstrap.css',
                    'node_modules/font-awesome/css/font-awesome.css',
                    'node_modules/slick-carousel-browserify/slick/slick.css',
                    'src/assets/stylesheets/navigation.css',
                    'src/assets/stylesheets/main-landing.less'
                ],
                cv: [
                    'node_modules/font-awesome/css/font-awesome.css',
                    'node_modules/slick-carousel-browserify/slick/slick.css',
                    'src/assets/stylesheets/navigation.css',
                    'src/assets/stylesheets/main-cv.less',
                ]
            },
            js: [
                'src/assets/scripts/main-landing.js',
                'src/assets/scripts/main-cv.js'
            ]
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

    const portFolioData = JSON.parse(fs.readFileSync('portfolio-data.json', 'utf8'));

    gulp.src(config.files.entry.jade)
        .pipe(jade({
            pretty: false,
            locals: portFolioData
        }))
        .pipe(gulp.dest('./build'));
});


//Gulp css task - handles css stuff(compiling less, autoprefixer, bundling with library files, minification and concatenation )
gulp.task('css', ['compile-jade'], () => {

    const autoPrefixerParameters = {
        browsers: ['last 3 versions'],
        cascade: false
    };

    function processCss (srcFiles, newName) {
        return gulp.src(srcFiles)
            .pipe(less())
            .pipe(autoprefixer(autoPrefixerParameters))
            .pipe(concat(newName))
            .pipe(minify())
            .pipe(gulp.dest('./build/css'));
    }

    //Landing page
    processCss(config.files.entry.stylesheets.landing, 'landing.css');

    //CV page
    processCss(config.files.entry.stylesheets.cv, 'cv.css');
});

//Gulp task scripts - for bundling, uglification
gulp.task('scripts', ['css'], () => {

    // Single entry point to browserify
    gulp.src(config.files.entry.js)
        .pipe(browserify({
            insertGlobals : true,
            debug : false
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./build/js'))
});

//Copy assets task images into build folder
gulp.task('copy-assets', ['scripts'], () => {
    gulp.src(config.files.all.images)
        .pipe(imagemin())
        .pipe(gulp.dest('./build/img'));

    gulp.src(config.files.all.fonts)
        .pipe(gulp.dest('./build/fonts'));

    gulp.src(config.files.all.documents)
        .pipe(gulp.dest('./build/documents'));
});

//Gulp dev-server task: starts express server
gulp.task('dev-server', ['copy-assets'], (cb) => {

    let started = false;

    return nodemon({
        script: config.files.server,
        ignore: [
            config.files.all.project
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
gulp.task('serve', ['dev-server'], function () {
    browserSync.init(null, config.browserSync);
});

gulp.task('watch', ['serve'], () => {
    gulp.watch([config.files.data, config.files.all.jade], ['compile-jade']);
    gulp.watch([config.files.entry.stylesheets.landing, config.files.entry.stylesheets.cv, config.files.all.less], ['css']);
    gulp.watch(config.files.all.js, ['scripts']);
});

gulp.task('default', ['watch']);