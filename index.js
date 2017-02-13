module.exports = {
    // Extend website resources and html
    website: {
        assets: "./book",
        css: [
            "github-embed.css"
        ]
    },
    blocks: {
        github_embed: {
            process: require('./src/tag')
        }
    },
};
