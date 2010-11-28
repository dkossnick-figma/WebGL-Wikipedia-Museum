/**
 * Wikipedia Art Browser
 * Written for node.js
 */

var http = require("http"),
    sys = require("sys"),
    express = require("express"),
    wikipedia = require("./wikipedia"),
    WAGConsts = require("./WAGConsts");

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
  res.send({
    resultCode: WAGConsts.UNKNOWN_METHOD
  });
});

/**
 * Given a category, sets the active category in the session and returns the
 * first set of images for it.
 */
app.get("/category/:cat", function(req, res) {
  wp.getCategoryImages(req.params.cat, function(data) {
    if (data.length == 0) {
      res.send({
        resultCode: WAGConsts.EMPTY_CATEGORY
      });
      return;
    }

    var images = [];
    for (var i in data) {
      images.push(data[i].image_title);
    }

    // Now get thumbs for each of the images
    wp.getImageThumbs(images, 400, function(thumbdata) {
      for (var i in data) {
        var image_title = data[i].image_title;
        if (thumbdata[image_title]) {
          data[i].thumb_url = thumbdata[image_title];
        } else {
          console.error("CONSISTENCY: Did not retrieve thumb for "+image_title);
          res.send({
            resultCode: WAGConsts.UNKNOWN
          });
          return;
        }
      }
      res.send({
        resultCode: WAGConsts.SUCCESS,
        data: data
      });
    });
  });
});

/**
 * Given an active session, returns more images for the given category.
 * If none, returns null.
 */
app.get("/more", function(req, res) {
  console.log("More called");
});

app.listen(8900);
console.log("Server running");
