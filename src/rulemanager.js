"use strict";

var validUrl = require("valid-url");
var fs = require("fs");

function RuleManager(rulesetPath) {
    try {
        var rulesetContent = JSON.parse(fs.readFileSync(rulesetPath));
        this.ruleset = rulesetContent.ruleset;
    } catch (error) {
        console.error(error);        
    }

    this.doesRuleApplyFor = function(documentUri, rule) {
        if (!rule.include && !rule.exclude) {
            return true;
        }

        if (rule.include && rule.exclude) {
            console.error("Misconfigured rule - only include or exclude can be configured: " + rule.toString());
            return false;
        }

        if (rule.include) {
            for(var i = 0; i < rule.include.length; i++) {
                var regEx = new RegExp(rule.include[i]);
                if (regEx.test(documentUri)) {
                    return true;
                }
            }

            return false;
        }

        if (rule.exclude) {
            for(var i = 0; i < rule.exclude.length; i++) {
                var regEx = new RegExp(rule.exclude[i]);
                if (regEx.test(documentUri)) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }
}

module.exports = RuleManager;

