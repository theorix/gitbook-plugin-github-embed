const tester = require('gitbook-tester');

it('should embed url', () => {
    return tester.builder()
        .withLocalPlugin(require('path').join(__dirname, '..'))
        .withContent('{% github_embed %}caption{% endgithub_embed %}')
        .create()
        .then(function(result) {
            const { content } = result[0];
            
            content.should.equal('<p>Hello caption</p>')
        })
})
