const hideLines = require('../src/hidelines');

const template = `
var x = {};
function() {

    this.x = function() {
        const y = 2;
        const x = 3;
        return x + y;
    }

    this.another = function() {
        return {
            x: 0,
            y: 1,
            z: 2
        };
    }

}
`

describe('hideLines', () => {

    it('should hide if single line', () => {
        hideLines(template, ['4-16']).should.equal(`
var x = {};
function() {

    // 13 lines hidden…

}
`)
    })

    it('should hide if single and multi line', () => {
        hideLines(template, ['1', '4-16']).should.equal(`
// line hidden…
function() {

    // 13 lines hidden…

}
`)
    })

    it('should hide if single and multi line and offsets', () => {
        hideLines(template, ['4', '7-19'], 4).should.equal(`
// line hidden…
function() {

    // 13 lines hidden…

}
`)
    })

    it('should accept numbers/strings', () => {
        hideLines(template, [4, '6', '8-18'], 4).should.equal(`
// line hidden…
function() {
// line hidden…
    this.x = function() {
    // 11 lines hidden…
    }

}
`)
    })
})
