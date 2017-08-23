
var { trimmer } = require('../src/trimmer');

describe('trimmer', () => {

    it('should trim snippet to shortest whitespace before', () => {
        trimmer(`
        function() {
            return {
                x: 'string'
            }
        }
`).should.equal(`
function() {
    return {
        x: 'string'
    }
}
`)
    })

    it('should trim snippet to shortest whitespace before with shortest last', () => {
        trimmer(`
        return {
            x: 'string'
        }
    }
`).should.equal(`
    return {
        x: 'string'
    }
}
`)
    })

    it('should trim snippet to same', () => {
        trimmer(`function() {
    return {
        x: 'string'
    }
}`).should.equal(`function() {
    return {
        x: 'string'
    }
}`)
    })

    it('should trim snippet to same with starting newline', () => {
        trimmer(`
function() {
    return {
        x: 'string'
    }
}`).should.equal(`
function() {
    return {
        x: 'string'
    }
}`)
    })

    it('should trim snippet to same with shortest last', () => {
        trimmer(`
        return {
            x: 'string'
        }
    }`).should.equal(`
    return {
        x: 'string'
    }
}`)
    })
})

