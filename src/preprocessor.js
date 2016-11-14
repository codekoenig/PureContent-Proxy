var cheerio = require("cheerio");
var validUrl = require("valid-url");
var fs = require("fs");

/**
 * Preprocess HTML content and remove unnecessary content
 * @param {String} The HTML content to preprocess
 * @return {Promise} Promise that contains the preprocessed HTML content when resolved
 **/
function preprocess(content) {
    
    return new Promise((resolve) => {
        $ = cheerio.load(content);

        removeUnnecessaryTags($);
        removeHiddenTags($);
        removeEmptyDivs($);
        unwrapDivs($);
        // fs.writeFileSync("before.html", $.html());
        mergeSiblings($);
        // fs.writeFileSync("after.html", $.html());
        fixImageLazyLoading($);

        resolve($.html());
    }); 
}

function removeUnnecessaryTags($) {
    var start = new Date();

    $("script").remove();
    $("noscript").remove();
    $("header").remove();
    $("footer").remove();
    $("aside").remove();
    $("nav").remove();

    console.log("removeUnneccessaryTags: " + getDurationString(start));
}

function removeHiddenTags($) {
    var start = new Date();
    $(".hide, .hidden").remove();
    console.log("removeHiddenTags: " + getDurationString(start));
}

function removeEmptyDivs($) {
    var start = new Date();

    $("div").each(function() {
        var element = $(this);
        var parentElement = $(this).parent();

        if (element.children().length == 0) {
            if (element.text().trim().length > 0) {
                element.html("<p>" + element.text() + "</p>");
            }
            else {
                element.remove();
            }
        }
    })

    console.log("removeEmptyDivs: " + getDurationString(start));
}

function unwrapDivs($) {
    var start = new Date();

    $("div").each(function() {
        if ($(this).children().length === 1 && $(this).children().first().is("div")) {
            $(this).replaceWith($(this).children());
        }
    });

    console.log("unwrapDivs: " + getDurationString(start));
}

function mergeSiblings($) {
    var start = new Date();

    $("div").each(function() {
        var element = $(this);

        if (element.children().length === element.children("div").length) {
            element.children().each(function() {
                element.append($(this).children());
                $(this).remove();
            });
        }
    });

    console.log("mergeSiblings: " + getDurationString(start));
}

/**
 * Replaces the value of attribute src of an img element if we find any URI in other attribs of the img element
 * Todo: Handle different cases of lazy loading images and consider moving this to a postprocessor
 **/
function fixImageLazyLoading($) {
    var start = new Date();

    // Find all img elements
    $("img").each(function(i, imgElement) {
        // Iterate over all attributes of the current img
        for (var imgAttribKey in imgElement.attribs){
            // Ignore some standard properties
            if (imgAttribKey === "src" || imgAttribKey === "class") {
                continue;
            }

            // Check if the attribute value is an URI
            if (validUrl.isUri(imgElement.attribs[imgAttribKey]))
            {
                cheerioImgElement = $(imgElement);
                console.log("Found lazy loaded img attribute " + imgAttribKey + ": " + imgElement.attribs[imgAttribKey]);

                // Replace the current src attribute with this one as we suspect it to be the img URI for lazy laoding
                cheerioImgElement.attr("src", imgElement.attribs[imgAttribKey]);
                break;
            }
        }
    });

    console.log("fixImageLazyLoading: " + getDurationString(start));
}

function getDurationString(startDate) {
    return (new Date() - startDate).toString() + " ms";
}

module.exports = preprocess;