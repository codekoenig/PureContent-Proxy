# PureContent Proxy

A node.js & express based proxy server for [node-readability](https://github.com/luin/readability) to serve only relevant
content of a webpage.

## Current state

This is currently a work-in-progress experiment.
When finished, it should serve pure content of newsfeed articles for my [NewsSync](http://www.newssync.net) apps & website.

In it's current state, it simply serves the pure content of a webpage found at the given URI. It is planned to extend this 
with a caching layer so the parsing of a full webpage has to be done only once. 