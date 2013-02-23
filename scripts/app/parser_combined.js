define(["libs/maybeerror", "libs/parsercombs", "app/ast"], function (ME, PC, AST) {
    "use strict";
    
    var QONE = AST.quantifier(1, 1, true),
        digit = PC.item
            .check(function(c) {return c.match(/^\d/);}),
        num = digit.many1()
            .fmap(function(ds) {return parseInt(ds.join(''), 10);}),
        slash = PC.literal('\\');
    
    
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
            .plus(PC.literal('^').seq2R(PC.pure('start of input')))
            .plus(PC.literal('$').seq2R(PC.pure('end of input')))
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
    
    var char = PC.item.check(function(c) {return !(c in SPECIALS);})
            .plus(slash.seq2R(PC.item.bind(escapeAction)))
            .fmap(AST.char);
    
    var dot = PC.literal('.')
            .seq2R(PC.pure(AST.dot()));
    
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
    
    var plus = PC.literal('+')
            .seq2R(PC.pure([1, null])),
        star = PC.literal('*')
            .seq2R(PC.pure([0, null])),
        qmark = PC.literal('?')
            .seq2R(PC.pure([0, 1])),
        qSimple = PC.any([plus, star, qmark]);
        
    var quantifier = PC.app(
        function(lohi, greed) {
            var isGreedy = (greed === true) ? true : false; // looks weird but avoids coercions
            return AST.quantifier(lohi[0], lohi[1], isGreedy);
        },
        qComplex.plus(qSimple),
        PC.literal('?').optional(true));
    // done with quantifiers

    var regex = new PC(function() {}), // a 'forward declaration'
        sequence = new PC(function() {}),
        single = new PC(function() {});

    var range = PC.app(
            AST.range,
            char,
            PC.literal('-').seq2R(char)),
        any2 = PC.app(function(_1, isNegated, regexes, _2) {
                return AST.any(isNegated, regexes);
            },
            PC.literal('['),
            PC.literal('^').seq2R(PC.pure(true)).optional(false),
            PC.any([range, char, charclass]).fmap(function(p) {return AST.regex(p, QONE);}).many1(),
            PC.literal(']')),
        seq_or_single = sequence.plus(single),
        any1 = PC.app(function(r, rs) {
                return AST.regex(AST.any(false, [r].concat(rs)), QONE);
            }, 
            seq_or_single, 
            PC.literal('|').seq2R(seq_or_single).many1());
        
    var group = PC.app(
            function(op, r, _) {
                if(op.value === '(?:') {
                    return AST.group(false, r);
                }
                return AST.group(true, r);
            },
            PC.literal('(?:').plus(PC.literal('(')),
            regex,
            PC.literal(')'));

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