module.exports = {
    // Extend website resources and html
    website: {
        assets: "./book",
        css: [
            "github-embed.css"
        ]
    },
    blocks: {
        lanying_code_snippet: {
            process: require('./src/tag')
        }
    },
    hooks: {
        init: require('./src/init'),
        "page:before": require('./src/page')
    },
};
