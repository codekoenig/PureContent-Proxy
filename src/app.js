var express = require("express");
var readability = require("node-readability");
var url = require("url");
var querystring = require("querystring");
var jsdom = require("jsdom");
var req = require("request");

console.log("Server is starting up ...");

var app = express();

app.get("/", function(request, response) {
    response.send("NiceSync - Readability server for NewsSync");
});

app.get("/document", function(request, response) {

    var targetUrlString = querystring.unescape(request.query["targetUri"]);
    var targetUrl = url.parse(targetUrlString);
    var content; 

    // Check if targetUri was passed and if it was possible to parse it to an URL
    if (targetUrl.host == null) {
        response.sendStatus(404);
        return;
    }

    // Try download the page from the targetUrl
    req(targetUrl.href, function(error, res, body) {

        if (error) {
            response.sendStatus(404);
            return;
        }

        // Try to parse this with Readability
        var readabilityUri = {
            spec: targetUrl.href,
            host: targetUrl.host,
            prePath: targetUrl.protocol + "//" + targetUrl.host,
            scheme: targetUrl.protocol.substring(0, targetUrl.protocol.indexOf(":")),
            pathBase: targetUrl.protocol + "//" + targetUrl.host + targetUrl.pathname.substring(0, targetUrl.pathname.lastIndexOf("/") + 1)
        }

        jsdom.env(body, function(err, window) {
            var article = new readability.Readability(readabilityUri, body.Document);
            window.close();
        });
    });
});

app.listen(8081, function() {
    console.log("Server running at :8081");
});

