const matcher = require('../src/url-matcher');
const baseRequest = {
    owner: 'v5analytics',
    repo: 'gitbook-plugin-github-embed'
};

describe('url matchers', () => {

    it('should match blob urls no lines', () => {
        matcher(repoUrl("blob/6bf0b7cb/index.js")).should.deep.equal({
            request: Object.assign({}, baseRequest, {
                ref: '6bf0b7cb',
                path: 'index.js'
            }),
            extension: 'js',
            lines: [undefined, undefined]
        })
    })

    it('should match blob urls nested path', () => {
        matcher(repoUrl("blob/6bf0b7cb/a/b/cde/f/index.js")).should.deep.equal({
            request: Object.assign({}, baseRequest, {
                ref: '6bf0b7cb',
                path: 'a/b/cde/f/index.js'
            }),
            extension: 'js',
            lines: [undefined, undefined]
        })
    })

    it('should match blob urls start line', () => {
        matcher(repoUrl("blob/6bf0b7cb/index.js#L10")).should.deep.equal({
            request: Object.assign({}, baseRequest, {
                ref: '6bf0b7cb',
                path: 'index.js'
            }),
            extension: 'js',
            lines: ['10', undefined]
        })
    })
    
    it('should match blob urls start and end line', () => {
        matcher(repoUrl("blob/6bf0b7cb/index.js#L10-L120")).should.deep.equal({
            request: Object.assign({}, baseRequest, {
                ref: '6bf0b7cb',
                path: 'index.js'
            }),
            extension: 'js',
            lines: ['10', '120']
        })
    })

    it('should match blob urls multiple exts, no lines', () => {
        matcher(repoUrl("blob/6bf0b7cb/index.src.js")).should.deep.equal({
            request: Object.assign({}, baseRequest, {
                ref: '6bf0b7cb',
                path: 'index.src.js'
            }),
            extension: 'js',
            lines: [undefined, undefined]
        })
    })

    it('should match blob urls multiple exts, start line', () => {
        matcher(repoUrl("blob/6bf0b7cb/index.src.js#L10")).should.deep.equal({
            request: Object.assign({}, baseRequest, {
                ref: '6bf0b7cb',
                path: 'index.src.js'
            }),
            extension: 'js',
            lines: ['10', undefined]
        })
    })

    it('should match blob urls multiple exts, start and end line', () => {
        matcher(repoUrl("blob/6bf0b7cb/index.src.js#L10-L120")).should.deep.equal({
            request: Object.assign({}, baseRequest, {
                ref: '6bf0b7cb',
                path: 'index.src.js'
            }),
            extension: 'js',
            lines: ['10', '120']
        })
    })
})
