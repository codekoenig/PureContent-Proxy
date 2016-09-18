var server = require("./server.js");
var port = process.env.PORT || 8081;

console.log("Starting up server at port " + port + " ...");

server.serve();
