var GitHubApi = require('github');
var { EOL } = require('os');
var matcher = require('./url-matcher');
var { trimmer } = require('./trimmer');
var Promise = require('bluebird');
var { Encoder } = require('node-html-encoder');
var entityEncoder = new Encoder('entity');

module.exports = function processGithubEmbed(block) {
    console.log('processGithubEmbed');
    if (block.args.length !== 1) {
        throw Error('Required url parameter')
    }
    var url = block.args[0];
    return extractSnippet(url, block.kwargs || {})
}

function setupGithub() {
    console.log('setupGithub');
    var api = new GitHubApi({
        protocol: 'https',
        host: 'api.github.com',
        headers: {
            'user-agent': 'gitbook-plugin-github-embed'
        },
        Promise: require('bluebird')
    });
    var token = process.env['GITBOOK_EMBED_GITHUB_API_TOKEN'] || process.env['GITHUB_API_TOKEN'];
    if (token) {
        api.authenticate({ type: 'oauth', token: token });
    }
    return api;
}

function extractSnippet(url, options) {
    console.log('extractSnippet');
    var github = setupGithub();
    var { request, lines, extension } = matcher(url)
    var fileName;

    return Promise.try(() => github.repos.getContent(request))
        .then(function(result) {
            if (result.type !== 'file') throw Error('Resource is not a file')
            if (result.size === 0) throw Error('Resource is empty')
            if (result.size >= 1024 * 1024) throw Error('Resource is too large to embed')
            if (!result.content) throw Error('No content available')

            fileName = result.name;

            var contents = Buffer.from(result.content, 'base64').toString()

            if (lines && lines[0] !== undefined) {
                var ln = contents.split(EOL);
                var start = parseInt(lines[0], 10);
                var end = lines[1] === undefined ? start : parseInt(lines[1], 10);
                var contentsWithinLines = ln.slice(start - 1, end).join(EOL);

                if (options.hideLines) {
                    return require('./hidelines')(contentsWithinLines, options.hideLines, start + 1)
                }

                return contentsWithinLines;
            }

            if (options.hideLines) {
                return require('./hidelines')(contents, options.hideLines, 2);
            }

            return contents
        })
        .then(code => {
            var trimmed = code.replace(/[\s\n\r]*$/g, '')
            var language = '';
            var link = ''

            if (options.reindent !== false) {
                trimmed = trimmer(trimmed)
            }

            if (extension) {
                language = 'lang-' + extension
                if (extension == 'vue'){
                    language = 'lang-js'
                }
            }

            if (options.showLink !== false) {
                let name = fileName;
                if (lines[0] !== undefined) {
                    if (lines[1] === undefined) {
                        name += ` (line ${lines[0]})`
                    } else {
                        name += ` (lines ${lines[0]}–${lines[1]})`
                    }
                }

                link = `<div class="github-embed-caption"><a title="Show Full Source of ${fileName}" href="${url}">${name}</a></div>`;
            }
            console.log('ABOUT TO RETURN ');
            return `<pre><code class="${language}">${entityEncoder.htmlEncode(trimmed)}</code></pre>${link}`
        });
}
