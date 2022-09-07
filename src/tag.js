var GitHubApi = require('github');
var { EOL } = require('os');
var matcher = require('./url-matcher');
var { trimmer } = require('./trimmer');
var Promise = require('bluebird');
var { Encoder } = require('node-html-encoder');
var entityEncoder = new Encoder('entity');
var exec = require("child_process").execSync
var repoCache = {}

module.exports = function processGithubEmbed(block) {
    const pluginOptions = this.config.get('pluginsConfig')['github-embed']
    var options = block.kwargs || {}
    if(!repoIsExist(options, pluginOptions)){
        console.log("repo not found, so skip:", options.repo)
        return "";
    }
    console.log("extractCodeSnippet:", options)
    return extractCodeSnippet({...pluginOptions, ...options})
}

function repoIsExist(options, pluginOptions) {
    var repoList = pluginOptions['repositories'] || []
    var hasRepo = false
    repoList.forEach(repo => {
        if (repo.name == options.repo){
            hasRepo = true
        }
    })
    return hasRepo
}
function extractCodeSnippet(options) {
    var cmd = `joern --script node_modules/gitbook-plugin-github-embed/src/tag.sc --params repo=${options.repo},className=${options.class},functionName=${options.function}` 
    var result = exec(cmd).toString().trim()
    var lines = result.split('\n')
    var lineDelimiter = "__LANYING_CODE_SNAPPET_LINE_DELIMITER__"
    var fieldDelimiter = "__LANYING_CODE_SNAPPET_FIELD_DELIMITER__"
    var html = ''
    var lineCache = {}

    lines.forEach(line => {
        var fields = line.split(fieldDelimiter)
        if (fields.length == 5 && fields[0] == "CodeSnippet"){
            var fileName = fields[1]
            var line = fields[2]
            var code = fields[3].replaceAll(lineDelimiter, '\n').replace(/^({)/, '').replace(/^(\n)/, '').replace(/(})$/, '')
            var repoPath = fields[4]
            console.log("Got:", fileName, line, code, repoPath)
            var head = repoCache[options.repo]
            if (!head) {
                var getHeadCmd = `cd ${repoPath} && git rev-parse HEAD`
                var getHeadResult = exec(getHeadCmd).toString().trim()
                head = getHeadResult.split('\n')[0]
                repoCache[options.repo] = head
            }
            if (!lineCache[`${fileName}|${line}`]) {
                html += transformCodeSnippet(options, fileName, line, code, head)
                lineCache[`${fileName}|${line}`] = true
            }
        }
    })
    return html
}

function transformCodeSnippet(options, fileName, line,  code, head) {
    var trimmed = code.replace(/[\s\n\r]*$/g, '')
    var language = '';
    var link = ''
    var repoList = options['repositories'] || []
    var repoUrl = ''
    repoList.forEach(repo => {
        if (repo.name == options.repo){
            repoUrl = repo.url
        }
    })

    var url = ''
    if (repoUrl.startsWith("git@")) {
        url = repoUrl.replaceAll(':', '/').replaceAll('git@', 'https://').replaceAll('.git', '')
    } else {
        url = repoUrl.replaceAll('.git', '')
    }
    url = `${url}/blob/${head}/${fileName}#L${line}`

    if (options.reindent !== false) {
        trimmed = trimmer(trimmed)
    }

    var extension = fileName.split('.').pop();
    if (extension) {
        if (extension == 'vue'){
            language = 'lang-js'
        } else if (extension == 'cc'){
            language = 'lang-c'
        } else {
            language = 'lang-' + extension
        }
    }

    if (options.showLink !== false) {
        link = `<div class="github-embed-caption"><a title="Show Full Source of ${fileName}" href="${url}">Github Source: ${fileName} (line ${line})</a></div>`;
    }
    return `<pre><code class="${language}">${entityEncoder.htmlEncode(trimmed)}</code></pre>${link}`
}
