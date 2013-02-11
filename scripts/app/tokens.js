define(function () {
    "use strict";
    
    var PRIORITIES = [
        'circumflex',  'dollarsign',  'plus',        'star',
        'qmark',       'alt',         'comma',       'dot',
        'dash',        'openq',       'closeq',      'openany',
        'closeany',    'opengroup',   'closegroup',  'class',
        'anchor',      'backref',     'char',        'escape', 
        'digit'
    ];
    
    var TOKENTYPES = {};
    PRIORITIES.map(function(t) {
        TOKENTYPES[t] = 1;
    });
    
    function token(tokentype, value) {
        if(!(tokentype in TOKENTYPES)) {
            throw {type: 'ValueError', expected: 'valid token type', actual: tokentype};
        }
        return {
            type: 'token',
            tokentype: tokentype,
            value: value
        };
    }
    
    return {
        tokentypes:  TOKENTYPES,
        priorities:  PRIORITIES,
        Token:  token
    };

});