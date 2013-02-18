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
    
    var anchor = tokentype('anchor')
            .plus(tokentype('circumflex'))
            .plus(tokentype('dollarsign'))
            .fmap(anchorAction),
        char = tokentype('char')
            .plus(tokentype('digit'))
            .plus(tokentype('escape'))
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

    var regex = new PC(function() {}); // a 'forward declaration'

    var range = PC.app(
            function(low, _, high) {return AST.range(low.value, high.value);},
            char,
            tokentype('dash'),
            char),
        any1 = PC.app(function(_1, negation, patterns, _2) {
                var isNegated = negation === false ? false : true,
                    regexes = patterns.map(function(p) {return AST.regex(p, QONE);});
                return AST.any(isNegated, regexes);
            },
            tokentype("openany"),
            tokentype("circumflex").optional(false),
            PC.any([char, charclass, range]).many1(),
            tokentype("closeany")),
        any2 = PC.app(function(r, rs) {
                return AST.any(false, [r].concat(rs));
            }, 
            regex, 
            tokentype('alt').seq2R(regex).many1()),
        any = any1.plus(any2);
    
/*
    Regex       :=   Pattern  Quantifier(?)
    
    Pattern     :=   Single  |  Sequence
    
    Single      :=   Any  |  Group  |  Anchor  |  Char  |  dot  |  backref  |  class
    
    Sequence    :=   Single({2,})
    
    Group       :=   opengroup  Regex  closegroup
*/
        
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
            tokentype('closegroup')),
        single = PC.any([any, group, anchor, char, dot, backref, charclass]),
        sequence = single.many1().check(function(rs) {
            return rs.length >= 2;
        }),
        pattern = single.plus(sequence);
        
    regex.parse = PC.app(AST.regex, pattern, quantifier.optional(QONE)).parse;
        
    
    return {
        'anchor'   :  anchor,
        'char'     :  char,
        'backref'  :  backref,
        'charclass':  charclass,
        'dot'      :  dot,
        
        quantifier : quantifier,

        'range'    :  range,
        'any'      :  any,
        
        'group'    :  group,
    };

});