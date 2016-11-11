var jsdom = require("jsdom");

/**
 * Preprocess HTML content and remove unnecessary content
 * @param {String} The HTML content to preprocess
 * @return {Promise} Promise that contains the preprocessed HTML content when resolved
 **/
function preprocess(content) {
    
    return new Promise((resolve) => {
        jsdom.env(content, function(error, window) {
            var scriptElements = window.document.getElementsByTagName("script");

            for(var i = 0, length = scriptElements.length; i < length; i++) {
                scriptElements[i].parentNode.removeChild(scriptElements[i]);
            }

            var processedContent = jsdom.serializeDocument(window.document);

            // Free memory
            window.close();

            resolve(processedContent);
        })
    }); 
}

module.exports = preprocess;