/**
 * Wikipedia Art Browser
 * Written for node.js
 */

var http = require("http"),
    fs = require("fs"),
    sys = require("sys"),
    express = require("express"),
    wikipedia = require("./wikipedia"),
    WAGConsts = require("../shared/WAGConsts");

process.on("uncaughtException", function(err) {
  console.error("Caught uncaught exception: " + err);
});

// Read in files
var catWhitelist = fs.readFileSync("catwhitelist.list", "utf-8").split("\n");

// Create the server
var app = express.createServer();
app.use(express.cookieDecoder());
app.use(express.session());

var wp = wikipedia.createInstance("en.wikipedia.org");

app.get("/", function(req, res) {
  res.send({
    resultCode: WAGConsts.UNKNOWN_METHOD
  });
});

function wrapResponse(responseData, responseFunc) {
  return responseFunc + "(" + JSON.stringify(responseData) + ");";
}

function sendWrappedError(res, errorCode, responseFunc) {
  res.send(wrapResponse({
    resultCode: errorCode
  }, responseFunc));
}

function handleCategoryImages(req, res, data) {
  if (data.pages.length == 0) {
    //sendWrappedError(res, WAGConsts.EMPTY_CATEGORY,
    //  "WAGinstance.handleCategoryImages");
    console.log(data.title + " was empty, skipping");
    req.session.curCategory = data.title;
    req.session.continueKey = "";
    appFuncMore(req, res);
    return;
  }

  // Store current parameters in session
  var oldContinueKey = req.session.continueKey;
  req.session.curCategory = data.title;
  req.session.continueKey = data.continuekey;

  var images = [];
  for (var i in data.pages) {
    images.push(data.pages[i].image_title);
  }

  // Now get thumbs for each of the images
  wp.getImageThumbs(images, 300, function(thumbdata) {
    for (var i in data.pages) {
      var image_title = wp.normalizePageTitle(data.pages[i].image_title);
      if (thumbdata[image_title]) {
        data.pages[i].thumb_url = thumbdata[image_title];
      } else {
        console.error("CONSISTENCY: Did not retrieve thumb for [[" +
          image_title + "]]");
        console.log(thumbdata);
        //sendWrappedError(res, WAGConsts.UNKNOWN,
        //  "WAGinstance.handleCategoryImages");
        //return;
        continue;
      }
    }
    var result = {
      category: req.session.curCategory,
      oldContinueKey: oldContinueKey,
      resultCode: WAGConsts.SUCCESS,
      data: data.pages
    };
    result.hasMore = !!data.continuekey;
    res.send(wrapResponse(result, "WAGinstance.handleCategoryImages"));
  });
}

/**
 * Given a category and a continue key, returns data for that exact resultset.
 */
app.get("/category/:cat/:ckey?", function(req, res) {
  wp.getCategoryImages(req.params.cat, req.params.ckey, function(data) {
    handleCategoryImages(req, res, data);
  });
});

/**
 * Called when the Art Gallery first initializes. Chooses an initial gallery in
 * which to start and returns whatever /category/:cat would return for it.
 */
app.get("/start", function(req, res) {
  var total = catWhitelist.length;
  var startIndex = Math.floor(Math.random() * catWhitelist.length);
  req.session.curIndex = startIndex;

  wp.getCategoryImages(catWhitelist[startIndex], null, function(data) {
    handleCategoryImages(req, res, data);
  });
});

/**
 * Given an active session, returns the next gallery room. That's either more
 * pics from the current active session or the next category in the whitelist.
 */
var appFuncMore = function(req, res) {
  if (req.session.curCategory) {
    if (req.session.continueKey) {
      // Continue with current category
      wp.getCategoryImages(req.session.curCategory, req.session.continueKey,
        function(data) {
          handleCategoryImages(req, res, data);
        });
    } else {
      // Go to next category
      req.session.curIndex = (req.session.curIndex + 1) % catWhitelist.length;
      wp.getCategoryImages(catWhitelist[req.session.curIndex], null,
        function(data) {
          handleCategoryImages(req, res, data);
        });
    }
  } else {
    console.error("Client violated protocol: should have called /start first");
    res.send({
      resultCode: WAGConsts.INVALID_ACTION
    });
    return;
  }
}
app.get("/more", appFuncMore);

app.listen(8900);
console.log("Server running");
