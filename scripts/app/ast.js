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

    function char(chr, q) {
        if(!(isChar(chr) && isQuant(q))) {
            throw new Error('type error');
        }
        this.asttype = 'char';
        this.value = chr;
        this.quantifier = q;
    }

    function dot(q) {
        if(!isQuant(q)) {
            throw new Error('type error');
        }
        this.asttype = 'dot';
        this.quantifier = q;
    }

    function backref(int, q) {
        if(!(typeof int === 'number' && isQuant(q))) {
            throw new Error('type error');
        }
        this.asttype = 'backref';
        this.value = int;
        this.quantifier = q;
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
        this.asttype = 'anchor';
        this.value = ANCHORS[a];
        this.quantifier = q;
    }

    function any(negate, phrases, q) {
        if(!(typeof negate === 'boolean' && isArray(phrases) && isQuant(q))) {
            throw new Error('type error');
        }
        this.asttype = 'any';
        this.negate = negate;
        this.phrases = phrases;
        this.quantifier = q;
    }

    function group(isCapture, phrases, q) {
        if(!(typeof isCapture === 'boolean' && isArray(phrases) && isQuant(q))) {
            throw new Error('type error');
        }
        this.asttype = 'group';
        this.isCapture = isCapture;
        this.phrases = phrases;
        this.quantifier = q;
    }

    function range(low, high, q) {
        if(!(isChar(low) && isChar(high) && isQuant(q))) {
            throw new Error('type error');
        }
        this.asttype = 'range';
        this.low = low;
        this.high = high;
        this.quantifier = q;
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