/**
 * Tool to generate the category whitelist.
 * Args: One or more parent categories.
 */

var wikipedia = require("./wikipedia"),
    fs = require("fs"),
    async = require("async");

var wp = wikipedia.createInstance("en.wikipedia.org");

var argc = process.argv.length;
if (argc <= 2) {
  console.error("Not enough arguments: need at least one category");
  process.exit(1);
}

var seen_cats = {};

async.concat(process.argv.slice(2),
  function(item, cb) {
    wp.getCategoryMembers(item, function(data) {
      if (data.query.categorymembers.length == 0) {
        console.warn("No members found for " + item);
      }
      cb(null, data.query.categorymembers);
    });
  },
  function(err, categories) {
    async.filter(categories,
      function(item, cb) {
        if (item.title in seen_cats) {
          cb(false);
        } else {
          seen_cats[item.title] = true;
          cb(item.ns == 14);
        }
      },
      function(results) {
        var fd = fs.openSync("catwhitelist.list", "w");
        results.forEach(function(cat) {
          fs.writeSync(fd, cat.title + "\n", null);
        });
        fs.closeSync(fd);
        console.log("Finished");
      }
    );
  }
);
