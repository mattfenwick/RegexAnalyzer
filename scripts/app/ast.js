define(function () {
    "use strict";
    
    function regex(isStart, phrases, isStop) {
        this.type = 'regex';
        this.isStart = isStart;
        this.phrases = phrases;
        this.isStop = isStop;
    }
    
    function isQuant(x) {
        return x.asttype === 'quantifier';
    }
    
    function isChar(x) {
        return typeof x === 'string' && x.length === 1;
    }
    
    function isArray(x) {
        var isNot = x.length === undefined || typeof x === 'string';
        return !isNot;
    }

    function char(chr, q) {
        if(!(isChar(chr) && isQuant(q))) {
            throw new Error('type error');
        }
        return {
            asttype: 'char',
            value: chr,
            quantifier: q
        };
    }

    function dot(q) {
        if(!isQuant(q)) {
            throw new Error('type error');
        }
        return {
            asttype: 'dot',
            quantifier: q
        };
    }

    function backref(int, q) {
        if(!(typeof int === 'number' && isQuant(q))) {
            throw new Error('type error');
        }
        return {
            asttype: 'backref',
            value: int,
            quantifier: q
        };
    }

    var ANCHORS = {
        'a':  'start of input',
        'z':  'end of input',
        'b':  'word boundary',
        'B':  'not a word boundary'
    };
    
    function anchor(a, q) {
        if(!(a in ANCHORS)) {
            throw new Error('value error -- bad anchor');
        }
        if(!isQuant(q)) {
            throw new Error('type error');
        }
        return {
            asttype: 'anchor',
            value: ANCHORS[a],
            quantifier: q
        };
    }

    function any(isNegated, phrases, q) {
        if(!(typeof isNegated === 'boolean' && isArray(phrases) && isQuant(q))) {
            throw new Error('type error');
        }
        return {
            asttype: 'any',
            isNegated: isNegated,
            phrases: phrases,
            quantifier: q
        };
    }

    function group(isCapture, phrases, q) {
        if(!(typeof isCapture === 'boolean' && isArray(phrases) && isQuant(q))) {
            throw new Error('type error');
        }
        return {
            asttype: 'group',
            isCapture: isCapture,
            phrases: phrases,
            quantifier: q
        };
    }

    function range(low, high, q) {
        if(!(isChar(low) && isChar(high) && isQuant(q))) {
            throw new Error('type error');
        }
        return {
            asttype: 'range',
            low: low,
            high: high,
            quantifier: q
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
            asttype:  'quantifier',
            low    :  low,
            high   :  high,
            isGreedy: isGreedy
        };
    }


    return {
        'regex'   :  regex,
        
        'char'    :  char,
        'dot'     :  dot,
        'backref' :  backref,
        'anchor'  :  anchor,
        
        'any'     :  any,
        'group'   :  group,
        'range'   :  range,
        
        quantifier:  quantifier
    };

});