var processFn = require("./src/tag")
var initFn = require("./src/init")
var pageBeforeFn = require("./src/page")

module.exports = {
    // Extend website resources and html
    website: {
        assets: "./book",
        css: [
            "lanying-code-snippet.css"
        ]
    }
};
