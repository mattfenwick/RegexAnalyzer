define(["libs/maybeerror", "libs/parsercombs", "app/ast", "app/tokens"], function (ME, PC, AST, TS) {
    "use strict";
    
    var QONE = AST.quantifier(1, 1, true);

    function tokentype(type) {
        return PC.satisfy(
            function(t) {
                return t.tokentype === type;
            });
    }

    var ANCHORS = {
        'a':  'start of input',
        'z':  'end of input',
        'b':  'word boundary',
        'B':  'not word boundary',
        '^':  'start of input',
        '$':  'end of input'
    };
    
    function anchorAction(t) {
        if(!(t.value in ANCHORS)) {
            throw new Error('unrecognized anchor: ' + t.value);
        }
        return AST.anchor(ANCHORS[t.value]);
    }

    var CLASSES = {
        'd': 'digit',
        'D': 'not digit',
        's': 'whitespace',
        'S': 'not whitespace',
        'w': 'word character',
        'W': 'not word character'
    };

    function classAction(t) {
        if(!(t.value in CLASSES)) {
            throw new Error('unrecognized class: ' + t.value);
        }
        return AST.charclass(CLASSES[t.value]);
    }
    
    var ESCAPES = {
        'n': '\n',
        't': '\t',
        'r': '\r',
        'f': '\f'
    };
    
    // wow, this is so ugly due to the {value: ...} stuff
    function escapeToChar(e) {
        if(e.value in ESCAPES) {
            return {value: ESCAPES[e.value]};
        }
        return {value: e.value};
    }        
    
    var anchor = tokentype('anchor')
            .plus(tokentype('circumflex'))
            .plus(tokentype('dollarsign'))
            .fmap(anchorAction),
        char = tokentype('char')
            .plus(tokentype('digit'))
            .plus(tokentype('escape').fmap(escapeToChar))
            .fmap(function(t) {return AST.char(t.value);}),
        dot = tokentype('dot')
            .seq2R(PC.pure(AST.dot())),
        backref = tokentype('backref')
            .fmap(function(t) {return AST.backref(parseInt(t.value, 10));}),
        charclass = tokentype('class')
            .fmap(classAction);
    
    var digit = tokentype('digit')
            .fmap(function(t) {return t.value;}),
        num = digit.many1()
            .fmap(function(ds) {return parseInt(ds.join(''), 10);}),
        qAmt1 = PC.app(function(low, _, high) {return [low, high];},
            num.optional(0),
            tokentype('comma'),
            num.optional(null)),
        qAmt2 = num.fmap(function(n) {return [n, n];}),
        qComplex = tokentype('openq')
            .seq2R(qAmt1.plus(qAmt2))
            .seq2L(tokentype('closeq'));
    
    var plus = tokentype('plus')
            .seq2R(PC.pure([1, null])),
        star = tokentype('star')
            .seq2R(PC.pure([0, null])),
        qmark = tokentype('qmark')
            .seq2R(PC.pure([0, 1])),
        qSimple = PC.any([plus, star, qmark]);
        
    var quantifier = PC.app(
        function(lohi, greed) {
            var isGreedy = (greed === true) ? true : false; // looks weird but avoids coercions
            return AST.quantifier(lohi[0], lohi[1], isGreedy);
        },
        qComplex.plus(qSimple),
        tokentype('qmark').optional(true));

    var regex = new PC(function() {}), // a 'forward declaration'
        sequence = new PC(function() {}),
        single = new PC(function() {});

    var range = PC.app(
            function(low, _, high) {return AST.range(low.value, high.value);},
            char,
            tokentype('dash'),
            char),
        any2 = PC.app(function(_1, negation, patterns, _2) {
                var isNegated = negation === false ? false : true,
                    regexes = patterns.map(function(p) {return AST.regex(p, QONE);});
                return AST.any(isNegated, regexes);
            },
            tokentype("openany"),
            tokentype("circumflex").optional(false),
            PC.any([range, char, charclass]).many1(),
            tokentype("closeany")),
        s_or_s = sequence.plus(single),
        any1 = PC.app(function(r, rs) {
                return AST.regex(AST.any(false, [r].concat(rs)), QONE);
            }, 
            s_or_s, 
            tokentype('alt').seq2R(s_or_s).many1());
        
    var group = PC.app(
            function(op, r, _) {
                if(op.value === '(') {
                    return AST.group(true, r);
                } else if(op.value === '(?:') {
                    return AST.group(false, r);
                }
                throw new Error('unrecognized open group: ' + op.value);
            },
            tokentype('opengroup'),
            regex,
            tokentype('closegroup'));

    single.parse = PC.app(
        AST.regex,
        PC.any([any2, group, anchor, char, dot, backref, charclass]),
        quantifier.optional(QONE)).parse;

    sequence.parse = single
        .many1()
        .check(function(rs) {
            return rs.length >= 2;
        })
        .fmap(function(rs) {
            return AST.regex(AST.sequence(rs), QONE);
        })
        .parse;
        
    regex.parse = any1.plus(sequence).plus(single).parse;
        
    
    return {
        'anchor'   :  anchor,
        'char'     :  char,
        'backref'  :  backref,
        'charclass':  charclass,
        'dot'      :  dot,
        
        quantifier : quantifier,
        
        'group'    :  group,
        'sequence' :  sequence,

        'range'    :  range,
        'any1'     :  any1,
        'any2'     :  any2,
        
        'regex'    :  regex
    };

});