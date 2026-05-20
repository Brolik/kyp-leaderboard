/**
 * build.js
 * Compiles src/ → dist/kyp-widget.js + .min.js
 *
 * Usage:
 *   node build.js          → production build (minified CSS + JS)
 *   node build.js --watch  → rebuild on file changes
 *
 * Dependencies (install once):
 *   npm install
 */

const fs         = require("fs");
const path       = require("path");
const sass       = require("sass");
const chokidar   = require("chokidar");
const { minify } = require("terser");

const SRC_DIR    = path.join(__dirname, "src");
const DIST_DIR   = path.join(__dirname, "dist");
const WIDGET_SRC = path.join(SRC_DIR,  "widget.js");
const TMPL_SRC   = path.join(SRC_DIR,  "template.html");
const SCSS_SRC   = path.join(SRC_DIR,  "styles.scss");
const DIST_JS    = path.join(DIST_DIR, "kyp-widget.js");
const DIST_MIN_JS = path.join(DIST_DIR, "kyp-widget.min.js");
const DIST_CSS   = path.join(DIST_DIR, "kyp-widget.css");

async function build() {
  const startTime = Date.now();

  // 1. Compile SCSS → CSS
  const cssResult = sass.compile(SCSS_SRC, {
    style: "compressed",   // minified; change to "expanded" for readable output
    sourceMap: false,
  });
  const compiledCSS = cssResult.css;

  // 2. Write standalone .css to dist/ (useful if consumers want to load it separately)
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(DIST_CSS, cssResult.css, "utf8");

  // 3. Read template HTML and collapse to a single line
  const templateHTML = fs.readFileSync(TMPL_SRC, "utf8")
    .replace(/<!--[\s\S]*?-->/g, "")   // strip HTML comments
    .replace(/\s*\n\s*/g, " ")         // collapse newlines
    .replace(/>\s+</g, "><")           // remove whitespace between tags
    .trim();

  // 4. Read widget source
  let widgetJS = fs.readFileSync(WIDGET_SRC, "utf8");

  // 5. Inject CSS — escape backticks and backslashes for safe embedding
  const escapedCSS = compiledCSS
    .replace(/\\/g, "\\\\")
    .replace(/`/g,  "\\`")
    .replace(/\$\{/g, "\\${");

  // 6. Inject HTML — same escaping
  const escapedHTML = templateHTML
    .replace(/\\/g, "\\\\")
    .replace(/`/g,  "\\`")
    .replace(/\$\{/g, "\\${");

  // 7. Replace placeholders
  widgetJS = widgetJS
    .replace('"__STYLES__"',   "`" + escapedCSS  + "`")
    .replace('"__TEMPLATE__"', "`" + escapedHTML + "`");

  // 8. Write unminified dist file
  fs.writeFileSync(DIST_JS, widgetJS, "utf8");

  // 9. Minify and write .min.js
  const minResult = await minify(widgetJS, { compress: true, mangle: true });
  fs.writeFileSync(DIST_MIN_JS, minResult.code, "utf8");

  const elapsed    = Date.now() - startTime;
  const jsSize     = (fs.statSync(DIST_JS).size    / 1024).toFixed(1);
  const minJsSize  = (fs.statSync(DIST_MIN_JS).size / 1024).toFixed(1);
  const cssSize    = (fs.statSync(DIST_CSS).size   / 1024).toFixed(1);

  console.log(`✓ Built in ${elapsed}ms`);
  console.log(`  dist/kyp-widget.js      ${jsSize} kB`);
  console.log(`  dist/kyp-widget.min.js  ${minJsSize} kB`);
  console.log(`  dist/kyp-widget.css     ${cssSize} kB`);
}

// ── Watch mode ──────────────────────────────────────────────────────────────
const isWatch = process.argv.includes("--watch");

if (isWatch) {
  console.log("Watching src/ for changes…\n");
  build().catch(err => console.error("Build error:", err.message));
  chokidar
    .watch(SRC_DIR, { ignoreInitial: true })
    .on("change", function (filePath) {
      console.log("Changed: " + path.relative(__dirname, filePath));
      build().catch(err => console.error("Build error:", err.message));
    });
} else {
  build().catch(err => {
    console.error("Build failed:", err.message);
    process.exit(1);
  });
}