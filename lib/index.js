const path = require("path"),
  fs = require("fs");

// attach all files that end in .js to our module.exports
fs.readdirSync(__dirname)
  .filter((file) => path.extname(file) === ".js" && file !== "index.js")
  .forEach(
    (file) =>
      (module.exports[path.basename(file, ".js")] = require(path.join(
        __dirname,
        file
      )))
  );
