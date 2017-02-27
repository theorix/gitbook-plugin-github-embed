describe('integration', function() {
    this.slow('10s');
    this.timeout('15s')

    const anchor = (lines, lineDesc) => `<div class="github-embed-caption"><a title="Show Full Source of index.js" href="https://github.com/visallo/gitbook-plugin-github-embed/blob/6bf0b7cb/index.js${lines || ''}" target="_blank">index.js${lineDesc}</a></div>`;

    it('should throw when no url', () => {
        return render('{% github_embed %}{% endgithub_embed %}', '').should.be.rejected
    })

    it('should embed single line blob type url', function() {
        const blobUrl = repoUrl("blob/6bf0b7cb/index.js#L13")

        return render(`{% github_embed "${blobUrl}" %}{% endgithub_embed %}`)
            .should.eventually.equal(p(code('process: <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">blk</span>) </span>{', anchor('#L13', ' (line 13)'))))
    })

    it('should embed single line blob type url without indenting', function() {
        const blobUrl = repoUrl("blob/6bf0b7cb/index.js#L13")

        return render(`{% github_embed "${blobUrl}", reindent=false %}{% endgithub_embed %}`)
            .should.eventually.equal(p(code('            process: <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">blk</span>) </span>{', anchor('#L13', ' (line 13)'))))
    })

    it('should embed whole file with hideLines', function() {
        const blobUrl = repoUrl("blob/6bf0b7cb/index.js#L2-L19")

        return render(`{% github_embed "${blobUrl}", hideLines=['3-9'] %}{% endgithub_embed %}`)
            .should.eventually.equal(p(code(`<span class="hljs-built_in">module</span>.exports = {
    <span class="hljs-comment">// 7 lines hidden&#x2026;</span>

    blocks: {
        github_embed: {
            process: <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">blk</span>) </span>{
                <span class="hljs-built_in">console</span>.log(<span class="hljs-string">&apos;In block: &apos;</span>, blk);
                <span class="hljs-keyword">return</span> <span class="hljs-string">&apos;Hello &apos;</span> + blk.body;
            }
        }
    },
};`, anchor('#L2-L19', ' (lines 2&#x2013;19)'))))
    })

    it('should embed whole file blob type url', () => {
        const blobUrl = repoUrl("blob/6bf0b7cb/index.js")

        return render(`{% github_embed "${blobUrl}" %}{% endgithub_embed %}`)
            .then(code => {
                code.split(require('os').EOL).length.should.equal(38)
            })
            .should.eventually.be.fulfilled
    })

    it('should embed whole file blob type url no link', () => {
        const blobUrl = repoUrl("blob/6bf0b7cb/index.js")

        return render(`{% github_embed "${blobUrl}", showLink=false %}{% endgithub_embed %}`)
            .then(code => {
                code.split(require('os').EOL).length.should.equal(38)
            })
            .should.eventually.be.fulfilled
    })

    it('should embed multi line blob type url', () => {
        const blobUrl = repoUrl("blob/6bf0b7cb/index.js#L12-L17")

        return render(`{% github_embed "${blobUrl}" %}{% endgithub_embed %}`)
            .should.eventually.equal(p(code(`github_embed: {
    process: <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">blk</span>) </span>{
        <span class="hljs-built_in">console</span>.log(<span class="hljs-string">&apos;In block: &apos;</span>, blk);
        <span class="hljs-keyword">return</span> <span class="hljs-string">&apos;Hello &apos;</span> + blk.body;
    }
}`, anchor('#L12-L17', ' (lines 12&#x2013;17)'))))
    })

    it('should embed multi line blob type url with blank lines', () => {
        const blobUrl = repoUrl('blob/6bf0b7cb/index.js#L24-L27')
        return render(`{% github_embed "${blobUrl}" %}{% endgithub_embed %}`)
            .should.eventually.equal(p(code(`<span class="hljs-keyword">var</span> github = <span class="hljs-keyword">new</span> GitHubApi({

    <span class="hljs-comment">// optional</span>
    debug: <span class="hljs-literal">true</span>,`, anchor('#L24-L27', ' (lines 24&#x2013;27)'))))
    })

})
