define(function () {
    "use strict";
    
    function isChar(x) {
        return typeof x === 'string' && x.length === 1;
    }
    
    function isArray(x) {
        var isNot = x.length === undefined || typeof x === 'string';
        return !isNot;
    }

    var ANCHORS = {
        'a':  'start of input',
        'z':  'end of input',
        'b':  'word boundary',
        'B':  'not a word boundary',
        '^':  'start of input',
        '$':  'end of input'
    };
    
    var CLASSES = {
        'd': 'digit',
        'D': 'non-digit',
        's': 'whitespace',
        'S': 'non-whitespace',
        'w': 'word character',
        'W': 'non-word character'
    };

    function regex(pattern, quantifier) {
        if(quantifier.type !== 'quantifier') {
            throw new Error('type error');
        }
        return {
            type      : 'regex',
            pattern   : pattern,
            quantifier: quantifier
        };
    }
    
    function any(isNegated, regexes) {
        if(!(typeof isNegated === 'boolean' && isArray(regexes))) {
            throw new Error('type error');
        }
        return {
            type     : 'pattern',
            pattype  : 'any',
            isNegated: isNegated,
            regexes  : regexes
        };
    }

    function sequence(regexes) {
        return {
            type   : 'pattern',
            pattype: 'sequence',
            regexes: regexes
        };
    }
    
    function group(isCapture, regex) {
        if(!(typeof isCapture === 'boolean' && regex.type === 'regex')) {
            throw new Error('type error');
        }
        return {
            type     : 'pattern',
            pattype  : 'group',
            isCapture: isCapture,
            regex    : regex
        };
    }

    function anchor(a) {
        if(!(a in ANCHORS)) {
            throw new Error('value error -- bad anchor');
        }
        return {
            type   : 'pattern',
            pattype: 'anchor',
            value  : ANCHORS[a]
        };
    }
    
    function char(chr) {
        if ( !isChar(chr) ) {
            throw new Error('type error');
        }
        return {
            type   : 'pattern',
            pattype: 'char',
            value  : chr
        };
    }

    function dot() {
        return {
            type   : 'pattern',
            pattype: 'dot'
        };
    }

    function backref(int) {
        if(typeof int !== 'number') {
            throw new Error('type error');
        }
        return {
            type   : 'pattern',
            pattype: 'backref',
            value  : int
        };
    }

    function myClass(chr) {
        if(!(chr in CLASSES)) {
            throw new Error('value error');
        }
        return {
            type   : 'pattern',
            pattype: 'class',
            value  : CLASSES[chr]
        };
    };

    function range(low, high) {
        if(!(isChar(low) && isChar(high))) {
            throw new Error('type error');
        }
        return {
            type   : 'pattern',
            pattype: 'range',
            low    : low,
            high   : high
        };
    }
    
    function quantifier(low, high, isGreedy) {
        if(typeof low !== 'number' && low !== null) {
            throw new Error('type error');
        }
        if(typeof high !== 'number' && high !== null) {
            throw new Error('type error');
        }
        if(typeof isGreedy !== 'boolean') {
            throw new Error('type error');
        }
        return {
            type     :  'quantifier',
            low      :  low,
            high     :  high,
            isGreedy :  isGreedy
        };
    }

/* Regex       --  (Pattern, Quantifier)
   Pattern
     Sequence  --  [Regex]
     Any       --  (Bool, [Regex])
     Group     --  (Bool, Regex)
     Anchor    --  character
     Char      --  character
     Dot       -- 
     Backref   --  Int
     Class     --  character
     Range     --  (character, character)
   Quantifier  --  (Int, Int, Bool)
*/

    return {
        'regex'   :  regex,
        
        sequence  :  sequence,
        'any'     :  any,
        'group'   :  group,
        'anchor'  :  anchor,        
        'char'    :  char,
        'dot'     :  dot,
        'backref' :  backref,
        'class'   :  myClass,
        'range'   :  range,
        
        quantifier:  quantifier
    };

});