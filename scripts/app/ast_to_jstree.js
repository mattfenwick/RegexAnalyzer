define(["app/ast"], function (AST) {


    function charClass(v) {
        return {'data': 'character class', children: ['value: ' + v.value]};
    }
    
    function sequence(v) {
        return {
            'data': 'sequence',
            children: [
                {data: 'all of:', state: 'open',
                 children: v.regexes.map(convertRegex)}]
        };
    }
    
    function any(v) {
        return {
            'data': 'choice',
            children: [
                {data: 'one of:', state: 'open',
                 children: v.regexes.map(convertRegex)},
                'negated: ' + (v.isNegated ? 'yes' : 'no')
            ]
        };
    }
    
    function group(v) {
        return {
            'data': 'group',
            children: [
                convertRegex(v.regex),
                'capturing: ' + (v.isCapture ? 'yes' : 'no')
            ]
        };
    }
    
    function anchor(v) {
        return {
            'data': 'anchor',
            children: ['value: ' + v.value]
        };
    }
    
    function char(v) {
        return {
            'data': 'literal character',
            children: [v.value] // what about chars like '\n', '\r' etc.?
        };
    }
    
    function dot(v) {
        return {'data': 'any character but newline', children: []};
    }
    
    function backref(v) {
        return {
            'data': 'backreference',
            children: ['capture group ' + v.value]
        };
    }
    
    function range(v) {
        return {
            'data': 'character range',
            children: [
                'low character: ' + v.low,
                'high character: ' + v.high
            ]
        };
    }

    var actions = {
        'sequence':  sequence,
        'any'     :  any,
        'group'   :  group,
        'anchor'  :  anchor,
        'char'    :  char,
        'dot'     :  dot,
        'backref' :  backref,
        'charclass'   :  charClass,
        'range'   :  range
    };
    
    function convertQuant(q) {
        return {
            data: ['quantity: ', 
                q.low, 
                '-',
                (q.high ? q.high : 'infinity'), 
                ', ', 
                (q.isGreedy ? '' : 'not '),
                'greedy'
            ].join('')
        };
    }

    function convertRegex(regex) {
        var f = actions[regex.pattern.pattype];
        if ( f ) {
            var val = f(regex.pattern);
            val.state = 'open';
            val.children.push(convertQuant(regex.quantifier));
            return val;
        }
        throw new Error('unrecognized pattern type from ' + JSON.stringify(regex));
    }
    
    return convertRegex;

});