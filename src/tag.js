const GitHubApi = require('github');
const { EOL } = require('os');
const matcher = require('./url-matcher');
const trimmer = require('./trimmer');
const Promise = require('bluebird');
const { Encoder } = require('node-html-encoder');
const entityEncoder = new Encoder('entity');

module.exports = function processGithubEmbed(block) {
    if (block.args.length !== 1) {
        throw Error('Required url parameter')
    }
    const url = block.args[0];
    return extractSnippet(url, block.kwargs || {})
}

function setupGithub() {
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
    const github = setupGithub();
    const { request, lines, extension } = matcher(url)
    var fileName;

    return Promise.try(() => github.repos.getContent(request))
        .then(function(result) {
            if (result.type !== 'file') throw Error('Resource is not a file')
            if (result.size === 0) throw Error('Resource is empty')
            if (result.size >= 1024 * 1024) throw Error('Resource is too large to embed')
            if (!result.content) throw Error('No content available')

            fileName = result.name;

            const contents = Buffer.from(result.content, 'base64').toString()

            if (lines && lines[0] !== undefined) {
                const ln = contents.split(EOL);
                const start = parseInt(lines[0], 10);
                const end = lines[1] === undefined ? start : parseInt(lines[1], 10);
                const contentsWithinLines = ln.slice(start - 1, end).join(EOL);

                return contentsWithinLines;
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

            return `<pre><code class="${language}">${entityEncoder.htmlEncode(trimmed)}</code></pre>${link}`
        })
        .catch(err => err.toString())
}
