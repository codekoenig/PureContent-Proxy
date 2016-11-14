# PureContent Proxy

A Node.js & express based proxy server for [node-readability](https://github.com/luin/readability) to serve only relevant
content of a webpage. Extends node-readability by applying several preprocessing rules to cleanup the HTML before it is
processed and fix issues like lazy image loading.

Going forward, it is planned to also add a caching layer to prevent rewriting the same document
multiple times as this process is very CPU intensive.

## How to use

### Startup PureContent Proxy with Node.js

Startup on default port 8080:

```shell
node run.js
```

To startup the proxy with a custom port, define it as a environment variable named PORT.
Most hosting environments that support Node.js, like Azure AppService, will do this automatically for you.

### Get the proxy's "pure content" rewirte of a web page

Sample request to get the rewirte of the URI `https://www.engadget.com/2016/11/11/nintendos-mini-nes-is-out-today/`:

```shell
GET http://localhost:8081/document?uri=https://www.engadget.com/2016/11/11/nintendos-mini-nes-is-out-today/
```

**Note:** It is recommended that you URL encode the URI you are passing to the `uri` querystring parameter.

## Current features

PureContent Proxy returns a rewirte of the document found at the given target URI that contains only relevant
text content. To do this, it uses the awesome node-readability library. To increase successful rewrite results
it applies various preprocessing rules to reduce unneccesary content in the original HTML and also fixes various
issues that prevent documents from being displayed correctly, like lazy loading of images.

### Current preprocessing features

* Removes the following tags from the HTML content:
  * `<script>`
  * `<noscript>`
  * `<header>`
  * `<footer>`
  * `<aside>`
  * `<nav>`
* Flattens the HTML hierarchy by merging nested `<DIV>`s into a single `<DIV>`
* In case of multiple `<DIV>` siblings below another `<DIV>`, merges them into a single `<DIV>`
* Removes nodes that hidden indicated by their style classes
* Detects lazy loading for images in a HTML document and replaces placeholdes with the real image URI
