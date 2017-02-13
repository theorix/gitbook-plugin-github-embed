const { EOL } = require('os');
const WHITESPACE = /^[^\S\n]*(?=[\S]+)/mg;

module.exports = function trimmer(src) {
    // Any content line has no prefix whitespace, do nothing
    if (src.match(/^[\S]/mg)) return src;

    const match = src.match(WHITESPACE)

    var shortest = Number.MAX_VALUE
    match.forEach(prefix => {
        const len = prefix.length
        shortest = Math.max(0, len < shortest ? len : shortest);
    })

    if (shortest !== Number.MAX_VALUE && shortest > 0) {
        const shorten = new RegExp('^\\s{' + shortest + '}', '')
        const reindented = src.replace(WHITESPACE, prefix => {
            return prefix.replace(shorten, '')
        })

        return reindented;
    }

    return src
}
