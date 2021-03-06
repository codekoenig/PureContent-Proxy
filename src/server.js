"use strict";

var express = require("express");
var url = require("url");
var querystring = require("querystring");
var readability = require("node-readability");
var preprocessor = require("./preprocessor.js");
var ruleManager = require("./rulemanager.js");

var app = express();
var currentRuleManager;

app.get("/", function(request, response) {
    response.send("NewsSync PureContent Proxy (Ruleset " + currentRuleManager.ruleset.version +")");
});

app.get("/document", function(request, response) {

    var targetUrlString = querystring.unescape(request.query["uri"] || request.query["targetUri"]);

    console.log("Request received for: " + targetUrlString);
    console.time("Request finished for " + targetUrlString);

    var targetUrl = url.parse(targetUrlString);
    var content; 

    // Check if targetUri was passed and if it was possible to parse it to an URL
    if (targetUrl.host == null) {
        response.sendStatus(404);
        console.warn("Received URI could not be parsed: " + targetUrlString);
        return;
    }

    // Try download the page from the targetUrl
    readability(
        targetUrl,
        {
            preprocess: function (content, response, contentType, callback) {
                var contentPromise = preprocessor(content, currentRuleManager, targetUrl.href);
                contentPromise.then(
                    function(processedContent) {
                        callback(null, processedContent);
                    })
                .catch(
                    function(reason) {
                        callback(null, content);
                    } 
                )
            },
            headers: {
                'User-Agent': 'PureContentProxy/1.0 (+http://www.newssync.net)'
            }
        },
        function(error, article, meta) {
            if (error) {
                response.sendStatus(500);
                console.error("Error on processing URI " + targetUrlString);
                console.error("    " + error.message);
                return;
            } 

            response.send(article.content);
            article.close();

            console.timeEnd("Request finished for " + targetUrlString);
        }
    );
});

exports.serve = function(port, rulesetPath) {
    console.log("Initializing RuleManager ...");
    currentRuleManager = new ruleManager(rulesetPath);
    console.log("Ruleset " + currentRuleManager.ruleset.version + " loaded");

    app.listen(port, function() {
        console.log("Server running at port " + port);
    });
};