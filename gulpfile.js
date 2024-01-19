// Initialize modules
const { src, dest, watch, series } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const babel = require("gulp-babel");
const terser = require("gulp-terser");
const browsersync = require("browser-sync").create();

// Use dart-sass for @use
sass.compiler = require("dart-sass");

// Sass Task
// Takes the style.scss file as input.
// Compiles Sass to CSS.
// Applies PostCSS with Autoprefixer for adding vendor prefixes and CSSNano for minification.
// Outputs the processed CSS file to the dist directory.
function scssTask() {
  return src("app/scss/style.scss", { sourcemaps: true })
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest("dist", { sourcemaps: "." }));
}

// JavaScript Task
// Takes the script.js file as input.
// Uses Babel to transpile modern JavaScript (ES6+) to a version compatible with most browsers.
// Minifies the JavaScript code using Terser.
// Outputs the processed JavaScript file to the dist directory.
function jsTask() {
  return src("app/js/script.js", { sourcemaps: true })
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(terser())
    .pipe(dest("dist", { sourcemaps: "." }));
}

// Browsersync
// Initializes a Browsersync server with the base directory set to the project root.
// It watches for changes in HTML files and triggers a reload when changes occur.
// It also watches for changes in Sass and JavaScript files, triggering the corresponding tasks (scssTask and jsTask), and then reloading the browser.
function browserSyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: ".",
    },
    notify: {
      styles: {
        top: "auto",
        bottom: "0",
      },
    },
  });
  cb();
}
function browserSyncReload(cb) {
  browsersync.reload();
  cb();
}

// Watch Task
// Watches for changes in HTML, Sass, and JavaScript files.
// When changes occur, it triggers the appropriate tasks (scssTask and jsTask) and reloads the browser using Browsersync.
function watchTask() {
  watch("*.html", browserSyncReload);
  watch(
    ["app/scss/**/*.scss", "app/**/*.js"],
    series(scssTask, jsTask, browserSyncReload)
  );
}

// Default Gulp Task
// Executes the scssTask, jsTask, browserSyncServe, and watchTask in series.
// This is the default task that will be run when you run gulp in the terminal.
exports.default = series(scssTask, jsTask, browserSyncServe, watchTask);

// Build Gulp Task
// Executes the scssTask and jsTask in series.
// This task is for building the project without setting up a development server or watching for changes.
exports.build = series(scssTask, jsTask, browserSyncServe, watchTask);
