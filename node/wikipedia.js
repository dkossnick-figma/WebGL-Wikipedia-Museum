/**
 * Implements Wikipedia API interface
 * For node.js
 */

var url = require("url"),
    rest = require("../../restler/lib/restler");

function Wikipedia(domain) {
  this.domain = domain;

  this._getEndpointURL = function(params) {
    params.format = "json";

    return url.format({
      protocol: "http:",
      host: this.domain,
      pathname: "/w/api.php",
      query: params
    });
  }

  this._sendRequest = function(params, cb) {
    var endpoint_url = this._getEndpointURL(params);
    rest.get(endpoint_url).addListener('complete', cb);
  }

  this._convertTitleToURLStyle = function(title) {
    return title.replace(/ /g, "_");
  }

  this._normalizePageTitle = function(title) {
    return title.replace(/^Image:/, "File:");
  }

  //
  // API Methods
  //

  this.getImageThumbs = function(titles, width, cb) {
    for (var i in titles) {
      titles[i] = this._convertTitleToURLStyle(titles[i]);
    }
    this._sendRequest({
      action: "query",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: width,
      titles: titles.join("|")
    }, function(data) {
      var images = [];
      if (data.query && data.query.pages) {
        for (var i in data.query.pages) {
          var image = data.query.pages[i];
          images[image.title] = image.imageinfo[0].thumburl;
        }
      }
      cb(images);
    });
  }

  this.getCategoryImages = function(cmtitle, continuekey, cb) {
    var request = {
      generator: "categorymembers",
      gcmtitle: cmtitle,
      gcmlimit: 8,
      action: "query",
      prop: "images|revisions",
      imlimit: 1,
      rvprop: "content",
      rvexpandtemplates: 1,
      rvsection: 0
    };

    if (continuekey) {
      request.gcmcontinue = continuekey;
    }

    this._sendRequest(request, function(data) {
      var result = {
        title: cmtitle,
        pages: []
      };
      if (data.query && data.query.pages) {
        var overall_regex = /\[\[((?:[Ii]mage|[Ff]ile):.+?)(?:\||\]\])/g,
            title_regex = /\[\[((?:[Ii]mage|[Ff]ile):.+?)(?:\||\]\])/,
            jpeg_regex = /\.(jpg|jpeg)/i,
            listof_regex = /^List of (.+)/,
            image_regex = /^Image:/;

        for (var page_id in data.query.pages) {
          var page = data.query.pages[page_id];
          if (page.title.match(listof_regex)) {
            continue;
          }
          var page_stage = {
            id:    page.pageid,
            title: page.title
          };
          if (page.images) {
            page_stage.image_title = page.images[0].title;
          } else {
            var content = page.revisions[0]['*'];
            var matches = content.match(overall_regex);
            if (matches) {
              for (var i in matches) {
                var title_matches = matches[i].match(title_regex);
                var title = title_matches[1];
                if (title.match(jpeg_regex)) {
                  page_stage.image_title = this._normalizePageTitle(title);
                }
              }
            }
          }
          // Only return page if an image was found for it
          if (page_stage.image_title) {
            result.pages.push(page_stage);
          }
        }

        if (data["query-continue"] &&
            data["query-continue"]["categorymembers"]) {
          result.continuekey =
            data["query-continue"]["categorymembers"].gcmcontinue;
        }
      }
      cb(result);
    }.bind(this));
  }
}

if (typeof exports != "undefined") {
  exports.createInstance = function(domain) {
    return new Wikipedia(domain);
  }
}
