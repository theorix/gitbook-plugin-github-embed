const chai = require('chai')
const { expect } = chai;
const should = chai.should()
const tester = require('gitbook-tester');

chai.use(require('chai-as-promised'))

global.Promise = require('bluebird')
global.expect = expect;
global.render = render;
global.repoUrl = path => `https://github.com/visallo/gitbook-plugin-github-embed/${path}`
global.p = str => `<p>${str}</p>`
global.code = (str, a) => `<pre><code class="lang-js">${str}</code></pre>${a || ''}`;

function render(input) {
    return tester.builder()
        .withLocalPlugin(require('path').join(__dirname, '..'))
        .withContent(input)
        .create()
        .then(function(result) {
            const { content } = result[0];
            return content
        })
}

