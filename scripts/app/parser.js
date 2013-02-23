define(["libs/maybeerror", "libs/parsercombs", "app/ast"], function (ME, PC, AST) {
    "use strict";
    
    var QONE = AST.quantifier(1, 1, true),
        digit = PC.item
            .check(function(c) {return c.match(/^\d/);}),
        num = digit.many1()
            .fmap(function(ds) {return parseInt(ds.join(''), 10);}),
        slash = PC.literal('\\');
        
    function matchThen(p, value) {
        return p.seq2R(PC.pure(value));
    }
    
    
    var ANCHORS = {
        'a':  'start of input',
        'z':  'end of input',
        'b':  'word boundary',
        'B':  'not word boundary'
    };
    
    function anchorAction(t) {
        if(t in ANCHORS) {
            return PC.pure(ANCHORS[t]);
        }
        return PC.zero;
    }     
    
    var anchor = slash.seq2R(PC.item.bind(anchorAction))
            .plus(matchThen(PC.literal('^'), 'start of input'))
            .plus(matchThen(PC.literal('$'), 'end of input'))
            .fmap(AST.anchor);
    
    // convert string to object where each key is a char from the string
    var SPECIALS = "^$+*?|,.{}[](:)-=!<>\\".split('').reduce(function(b, n) {b[n] = 1; return b;}, {});

    var ESCAPES = {
        'n': '\n',
        't': '\t',
        'r': '\r',
        'f': '\f'
    };
    
    function escapeAction(c) {
        if(c in SPECIALS) {
            return PC.pure(c);
        } else if(c in ESCAPES) {
            return PC.pure(ESCAPES[c]);
        }
        return PC.zero;
    }
    
    var normalChar = PC.item.check(function(c) {return !(c in SPECIALS);})
            .plus(slash.seq2R(PC.item.bind(escapeAction))),
        char = normalChar
            .fmap(AST.char);
    
    var dot = matchThen(PC.literal('.'), AST.dot());
    
    var CLASSES = {
        'd': 'digit',
        'D': 'not digit',
        's': 'whitespace',
        'S': 'not whitespace',
        'w': 'word character',
        'W': 'not word character'
    };

    function classAction(c) {
        if(c in CLASSES) {
            return PC.pure(CLASSES[c]);
        }
        return PC.zero;
    }
    
    var charclass = slash
            .seq2R(PC.item.bind(classAction))
            .fmap(AST.charclass);

    var backref = slash
            .seq2R(num)
            .fmap(AST.backref);
    

    // quantifiers 
    var qAmt1 = PC.app(function(low, _, high) {return [low, high];},
            num.optional(0),
            PC.literal(','),
            num.optional(null)),
        qAmt2 = num.fmap(function(n) {return [n, n];}),
        qComplex = PC.literal('{')
            .seq2R(qAmt1.plus(qAmt2))
            .seq2L(PC.literal('}'));
    
    var plus = matchThen(PC.literal('+'), [1, null]),
        star = matchThen(PC.literal('*'), [0, null]),
        qmark = matchThen(PC.literal('?'), [0, 1]),
        qSimple = PC.any([plus, star, qmark]);
        
    var quantifier = PC.app(
        function(lohi, isGreedy) {
            return AST.quantifier(lohi[0], lohi[1], isGreedy);
        },
        qComplex.plus(qSimple),
        matchThen(PC.literal('?'), false).optional(true));
    // done with quantifiers

    var regex = new PC(function() {}),    // forward declarations
        sequence = new PC(function() {}),
        single = new PC(function() {});

    var range = PC.app(
            AST.range,
            normalChar,
            PC.literal('-').seq2R(normalChar)),
        any2 = PC.app(function(_1, isNegated, regexes, _2) {
                return AST.any(isNegated, regexes);
            },
            PC.literal('['),
            matchThen(PC.literal('^'), true).optional(false),
            PC.any([range, char, charclass]).fmap(function(p) {return AST.regex(p, QONE);}).many1(),
            PC.literal(']')),
        seq_or_single = sequence.plus(single),
        any1 = PC.app(function(r, rs) {
                return AST.regex(AST.any(false, [r].concat(rs)), QONE);
            }, 
            seq_or_single, 
            PC.literal('|').seq2R(seq_or_single).many1());
        
    var nonCapture = matchThen(PC.string('(?:'), false),
        capture = matchThen(PC.literal('('), true),
        closeGroup = PC.literal(')'),
        group = PC.app(
            AST.group,
            nonCapture.plus(capture),
            regex.seq2L(closeGroup));

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