/**
 * Wikipedia Art Browser
 * Written for node.js
 */

var http = require("http"),
    sys = require("sys"),
    express = require("express"),
    wikipedia = require("./wikipedia");

var puts = sys.puts,
    inspect = sys.inspect;

process.addListener("uncaughtException", function(e) {
  puts(inspect(e));
});

var app = express.createServer();
app.use(express.cookieDecoder());
app.use(express.session());

var wp = wikipedia.createInstance("en.wikipedia.org");

app.get("/", function(req, res) {
  res.send("Welcome to the Wikipedia Art Browser backend service.");
});

/**
 * Given a category, sets the active category in the session and returns the
 * first set of images for it.
 */
app.get("/category/:cat", function(req, res) {
  wp.getCategoryImages(req.params.cat, function(data) {
    var images = [];
    for (var i in data) {
      images.push(data[i].image_title);
    }

    // Now get thumbs for each of the images
    wp.getImageThumbs(images, 400, function(thumbdata) {
      res.send("Hello world!");
      console.log(data);
      console.log(thumbdata);
    });
  });
});

app.listen(8900);
console.log("Server running");
