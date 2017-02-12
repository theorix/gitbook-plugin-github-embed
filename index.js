
module.exports = {
    hooks: {
        'page:before': function(page) {
            var options = this.options.pluginsConfig['github-embed'];
            console.log('options=', options);
            return page;
        }
    },

    blocks: {
        github_embed: {
            process: function(blk) {
                console.log('In block: ', blk);
                return 'Hello ' + blk.body;
            }
        }
    },
};

/*
function connect() {
    var GitHubApi = require('github');
    var github = new GitHubApi({

        // optional
        debug: true,
        protocol: 'https',
        host: 'api.github.com',
        headers: {
            'user-agent': 'gitbook-plugin-github-embed'
        },
        Promise: require('bluebird'),
        //followRedirects: false,
        //timeout: 5000
    });
}
*/
