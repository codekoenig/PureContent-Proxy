"use strict";

var cheerio = require("cheerio");
var validUrl = require("valid-url");
var fs = require("fs");

/**
 * Preprocess HTML content and remove unnecessary content
 * @param {String} The HTML content to preprocess
 * @param {RuleManager} The RuleManager that should be used to decide which rules should be executed
 * @param {String} String representation of the URI the content was retrieved from
 * @return {Promise} Promise that contains the preprocessed HTML content when resolved
 **/
function preprocess(content, ruleManager, contentUri) {
    var $;
    var rules = ruleManager.ruleset.rules;

    return new Promise((resolve) => {
        try {
            $ = cheerio.load(content);
        } catch (error) {
            console.log(error);
            resolve(content);
        }

        // fs.writeFileSync("before.html", $.html());
        
        if (rules.removeTags && ruleManager.doesRuleApplyFor(contentUri, rules.removeTags)) {
            removeTagBySelector($, rules.removeTags.tags, ruleManager, contentUri);
        }

        if (rules.removeTagsByClass && ruleManager.doesRuleApplyFor(contentUri, rules.removeTagsByClass)) {
            removeTagBySelector($, rules.removeTagsByClass.classes, ruleManager, contentUri);
        }

        if (rules.removeEmptyTags && ruleManager.doesRuleApplyFor(contentUri, rules.removeEmptyTags)) {
            removeEmptyTags($);
        }

        if (rules.unwrapDivs && ruleManager.doesRuleApplyFor(contentUri, rules.unwrapDivs)) {
            unwrapDivs($);
        }

        if (rules.mergeSiblings && ruleManager.doesRuleApplyFor(contentUri, rules.mergeSiblings)) {
            mergeSiblings($, rules.mergeSiblings.tags, ruleManager, contentUri);
        }

        if (rules.fixImageLazyLoading && ruleManager.doesRuleApplyFor(contentUri, rules.fixImageLazyLoading)) {
            fixImageLazyLoading($);
        }
        
        // fs.writeFileSync("after.html", $.html());

        resolve($.html());
    }); 
}

function removeTagBySelector($, selectors, ruleManager, contentUri ) {
    var start = new Date();

    for (var i = 0; i < selectors.length; i++) {
        var selector = selectors[i];

        if (ruleManager.doesRuleApplyFor(contentUri, selector)) {
            $(selector.value).remove();
        }
    }

    console.log("removeTagBySelector: " + getDurationString(start));
}

/**
 * Removes DIV tags that contain no children or, if they contain plain text, wraps them into a paragraph
 * @param Cheerio document to process
 **/
function removeEmptyTags($) {
    var start = new Date();

    $("div, span").each(function() {
        var element = $(this);

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

/**
 * Replaces DIV tags with their child if they contain only another, single DIV
 * @param Cheerio document to process
 **/
function unwrapDivs($) {
    var start = new Date();

    $("div").each(function() {
        if ($(this).children().length === 1 && $(this).children().first().is("div")) {
            $(this).replaceWith($(this).children());
        }
    });

    console.log("unwrapDivs: " + getDurationString(start));
}

/**
 * Merges siblings of the same kind into a single tag. This might be too agressive for many sites and should be only used opt-in.
 * @param Cheerio document to process
 **/
function mergeSiblings($, tags, ruleManager, contentUri) {
    var start = new Date();

    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];

        if (ruleManager.doesRuleApplyFor(contentUri, tag)) {
            $(tag.value).each(function() {
                var element = $(this);

                if (element.children().length === element.children(tag.value).length) {
                    element.children().each(function() {
                        element.append($(this).children());
                        $(this).remove();
                    });
                }
            });
        }
    }

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