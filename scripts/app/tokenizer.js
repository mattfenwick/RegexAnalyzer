define(["libs/maybeerror", "app/tokens"], function (MaybeError, Tokens) {
    "use strict";
    
    var T = Tokens.Token;
    
    function tok(tt) {
        return T.bind(null, tt);
    }

    var REGEXES = [
        ['circumflex', /^\^/], 
        ['dollarsign', /^\$/],
        ['plus',       /^\+/], 
        ['star',       /^\*/],
        ['qmark',      /^\?/], 
        ['alt',        /^\|/],
        ['comma',      /^\,/], 
        ['dot',        /^\./],
        ['dash',       /^\-/],
        ['openq',      /^\{/],
        ['closeq',     /^\}/],
        ['openany',    /^\[/],
        ['closeany',   /^\]/],
        ['opengroup',  /^\((?:\?\:)?/], // wow, that's just '(?:' or '?'
        ['closegroup', /^\)/],
        ['class',      /^\\[dDsSwW]/],
        ['anchor',     /^\\[bBaz]/],
        ['backref',    /^\\\d+/],
        ['char',       /^[^\^\$\+\*\?\|\,\.\{\}\[\]\(\:\)\-\=\!\<\>\\\d]/],
        ['escape',     /^\\[\^\$\+\*\?\|\,\.\{\}\[\]\(\:\)\-\=\!\<\>\\\.ntrf]/],
        ['digit',      /^\d/]
    ];
    
    function nextToken(str) {
        var i, name, re, match, chunk;
        for(i = 0; i < REGEXES.length; i++) {
            name = REGEXES[i][0];
            re = REGEXES[i][1];
            match = str.match(re);
            if ( match ) {
                chunk = match[0];
                return MaybeError.pure({rest: str.slice(chunk.length), token: T(name, chunk)});
            }
        }
        return MaybeError.error('no token matched');
    }
    
    function tokenize(str) {
        var tokens = [],
            input = str,
            t;
        while ( 1 ) {
            if( input.length === 0 ) {
                break;
            }
            t = nextToken(input);
            if( t.status === 'success' ) {
                input = t.value.rest;
                tokens.push(t.value.token);
            } else {
                return MaybeError.error({message: t.value, tokens: tokens, rest: input});
            }
        }
        return MaybeError.pure(tokens);
    }

    return {
        'scanner' :  tokenize,
        'regexes' :  REGEXES
    };

});