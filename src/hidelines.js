var { EOL } = require('os');
var { shortest } = require('./trimmer')

var regex = /^(\d+)(?:-(\d+))?$/

var changeOffset = (offset, hideLines) => {
    return hideLines.map(h => {
        return h.replace(regex, function(m, s, e) {
            var offsetStart = parseInt(s, 10) - offset;
            if (e) {
                var offsetEnd = parseInt(e, 10) - offset;
                return offsetStart + '-' + offsetEnd;
            }
            return offsetStart;
        })
    })
}

module.exports = function hideLines(content, _hidden, offset) {
    var hidden = _hidden.map(h => String(h))
    var lines = content.split(EOL)

    if (offset) {
        hidden = changeOffset(offset - 1, hidden);
    }

    hidden.reverse().forEach(remove => {
        var match = String(remove).match(regex);
        if (match) {
            var start = parseInt(match[1], 10);
            var len = match[2] ? (parseInt(match[2], 10) - start + 1) : 1;
            var removed = lines.splice(start, len)
            var whitespace = shortest(removed.join(EOL))
            var tab = '';
            if (whitespace !== Number.MAX_VALUE && whitespace > 0) {
                for (var i = 0; i < whitespace; i++) tab += ' ';
            }
            lines.splice(start, 0, `${tab}// ${len > 1 ? len + ' ' : ''}line${len > 1 ? 's' : ''} hidden…`)

        } else throw new Error('Invalid hidden line syntax "1-2, 3"')
    })
    return lines.join(EOL)
}
