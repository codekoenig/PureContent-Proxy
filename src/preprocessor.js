var cheerio = require("cheerio");
var validUrl = require("valid-url");

/**
 * Preprocess HTML content and remove unnecessary content
 * @param {String} The HTML content to preprocess
 * @return {Promise} Promise that contains the preprocessed HTML content when resolved
 **/
function preprocess(content) {
    
    return new Promise((resolve) => {
        $ = cheerio.load(content);

        removeUnnecessaryTags($);
        fixImageLazyLoading($);

        resolve($.html());
    }); 
}

function removeUnnecessaryTags($) {
    $("script").remove();
    $("noscript").remove();
    $("header").remove();
    $("footer").remove();
    $("aside").remove();
    $("nav").remove();
}

/**
 * Replaces the value of attribute src of an img element if we find any URI in other attribs of the img element
 * Todo: Handle different cases of lazy loading images and consider moving this to a postprocessor
 **/
function fixImageLazyLoading($) {
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
}

module.exports = preprocess;