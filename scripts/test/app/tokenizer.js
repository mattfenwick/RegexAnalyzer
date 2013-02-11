define(["app/tokens", "app/tokenizer", "libs/maybeerror"], function (Tokens, Tzer, ME) {

    return function() {
    
        module("tokenizer");
        var T = Tokens.Token,
            parse = Tzer.scanner;
            
        test("regex for each token type", function() {
            deepEqual(Tokens.priorities.length, Tzer.regexes.length);
        });
        
        test('punctuation', function() {
            propEqual(ME.pure([
                          T('opengroup', '('),
                          T('closegroup', ')'),
                          T('openany', '['),
                          T('closeany', ']'),
                          T('openq', '{'),
                          T('closeq', '}'),
                          T('opengroup', '(?:')]), 
                      parse("()[]{}(?:"));
        });
    };

});