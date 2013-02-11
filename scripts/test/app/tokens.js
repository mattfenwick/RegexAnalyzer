define(["app/tokens"], function (Tokens) {

    return function(helper) {
    
        module("tokens");
        var token = Tokens.Token;
        
        test("number of tokentypes", function() {
            deepEqual(21, Tokens.priorities.length, 'priorities');
            deepEqual(21, Object.keys(Tokens.tokentypes).length, 'tokentypes');
        });
        
        test("token constructors", function() {
            var i = 3,
                tests = Tokens.priorities.map(function(tt) {
                    i++;
                    deepEqual({tokentype: tt, type: 'token', value: 'hi: ' + i}, token(tt, 'hi: ' + i, i + 1), tt);
                });
        });
        
        test("invalid token type", function() {
            helper(function() {
                token('blargh?', 'hi');
            }, 'ValueError', 'invalid token type causes exception');
        });

    };

});