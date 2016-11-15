"use strict";

var server = require("./server.js");
var port = process.env.PORT || 8081;
var rulesetPath = process.env.RULESET || "ruleset.json";

console.log("Starting up server at port " + port + " ...");

server.serve(port, rulesetPath);
