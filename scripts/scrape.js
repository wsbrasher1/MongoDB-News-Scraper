//Require axios and cheerio, making our scrapes possible
var axios = require("axios");
var cheerio = require("cheerio");

var scrape = function() {
  return axios.get("https://www.mytimes.com/").then(res => {
    var $ = cheerio.load(res.data);
    var articles = [];

    $(".assetWrapper").each(function(i, element) {
      var head = $(this)
        .find("h2")
        .text()
        .trim();

      var url = $(this)
        .find("a")
        .attr("href");

      var sum = $(this)
        .find("p")
        .text()
        .trim();
      
      var img = $(this)
        .find("img")
        .attr("src");
        
      if (head && sum && url) {
        var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
        var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();

        var article = {
            headline: headNeat,
            summary: sumNeat,
            url,
            img
        }

        articles.push(article)
      }
    });
    
    return articles;
  });
};

module.exports = scrape;
