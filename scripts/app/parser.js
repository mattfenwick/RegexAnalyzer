define(["libs/maybeerror", "libs/parsercombs", "app/ast", "app/tokens"], function (ME, PC, AST, TS) {
    "use strict";

    function tokentype(type) {
        return PC.satisfy(
            function(t) {
                return t.tokentype === type;
            });
    }

/*
    Regex       :=   Pattern  Quantifier(?)
    
    Pattern     :=   Single  |  Sequence
    
    Single      :=   Any  |  Group  |  Anchor  |  Char  |  dot  |  backref  |  class
    
    Sequence    :=   Single({2,})
    
    Group       :=   opengroup  Regex  closegroup
    
    Any         :=   Any1  |  Any2
    
    Any1        :=   openany  circumflex(?)  ( Char  |  class  |  Range )(+)  closeany
    
    Any2        :=   Regex  ( alt  Regex )(+)
    
    Range       :=   Char  dash  Char
    
    Quantifier  :=   ( plus  |  star  |  qmark  |  QRange )  qmark(?)
    
    QRange      :=   openq  ( ( digit(*)  comma  digit(*) )  |  digit(+) )  closeq
*/
    
    var regex = new PC(function() {}); // a 'forward declaration'
    
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
            .plus(tokentype('escape')) // wait, when is the escape sequence translated to a single char?  do I have to do that here?
            .fmap(function(t) {return AST.char(t.value);}),
        dot = tokentype('dot')
            .seq2R(PC.pure(AST.dot())),
        backref = tokentype('backref')
            .fmap(function(t) {return AST.backref(parseInt(t.value, 10));}),
        charclass = tokentype('class')
            .fmap(classAction);
    
    // need to put these after the other group ...
    var group = tokentype('opengroup')
            .bind(function(t) {
                function action(r) {
                    if(t.value === '(') {
                        return AST.group(true, r);
                    } else if(t.value === '(?:') {
                        return AST.group(false, r);
                    }
                }
                return regex.fmap(action)
                   .seq2L(tokentype('closegroup'))
            }),
        range = PC.app(
            function(low, _, high) {return AST.range(low.value, high.value);},
            char,
            tokentype('dash'),
            char),
        any1 = PC.app(function() {},
            tokentype("openany"),
            tokentype("circumflex").optional(null), // or something for the value
            PC.any([char, charclass, range]).many1(),
            tokentype("closeany")),
        any2 = PC.all([regex, PC.all([tokentype('alt'), regex]).many1()]),
        any = any1.plus(any2);
    
    return {
        'anchor'   :  anchor,
        'char'     :  char,
        'backref'  :  backref,
        'charclass':  charclass,
        'dot'      :  dot
    };

});