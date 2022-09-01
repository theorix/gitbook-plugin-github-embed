var GitHubApi = require('github');
var { EOL } = require('os');
var matcher = require('./url-matcher');
var { trimmer } = require('./trimmer');
var Promise = require('bluebird');
var { Encoder } = require('node-html-encoder');
var entityEncoder = new Encoder('entity');
var exec = require("child_process").execSync
var repoCache = {}
module.exports = function init() {
    const options = this.config.get('pluginsConfig')['github-embed']
    repoList = options['repositories'] || []
    repoList.forEach(
        repo => {
            if (!repoCache[repo.name]){
                var cmd = `joern --script node_modules/gitbook-plugin-github-embed/src/init.sc --params name=${repo.name},url=${repo.url},branch=${repo.branch}` 
                var result = exec(cmd).toString().trim()
                repoCache[repo.name] = repo
            }
        }
    )
}
