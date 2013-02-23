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
        'start of input'   :  1,
        'end of input'     :  1,
        'word boundary'    :  1,
        'not word boundary':  1
    };
    
    var CLASSES = {
        'digit'             :  1,
        'not digit'         :  1,
        'whitespace'        :  1,
        'not whitespace'    :  1,
        'word character'    :  1,
        'not word character':  1
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
            value  : a
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

    function charclass(c) {
        if(!(c in CLASSES)) {
            throw new Error('value error -- ' + c);
        }
        return {
            type   : 'pattern',
            pattype: 'charclass',
            value  : c
        };
    };

    function range(low, high) {
        if(!(isChar(low) && isChar(high))) {
            throw new Error('type error -- ' + JSON.stringify([low, high]));
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
        'regex'     :  regex,
        
        'sequence'  :  sequence,
        'any'       :  any,
        'group'     :  group,
        'anchor'    :  anchor,        
        'char'      :  char,
        'dot'       :  dot,
        'backref'   :  backref,
        'charclass' :  charclass,
        'range'     :  range,
        
        'quantifier':  quantifier
    };

});